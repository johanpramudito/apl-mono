// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, model } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 });
    }
    if (!model || typeof model !== 'string') {
      return NextResponse.json({ error: "Model is required and must be a string" }, { status: 400 });
    }

    const modelName = model === "llama" ? "llama3.2:3b" : "deepseek-r1:7b"; // atau sesuaikan dengan nama model Ollama

    const stream = await ollama.chat({
      model: modelName,
      messages: [{ role: "user", content: text.trim() }],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const part of stream) {
          const chunk = JSON.stringify(part);
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}