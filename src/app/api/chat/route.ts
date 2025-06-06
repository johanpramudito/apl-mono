// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createMessage } from "@/lib/prisma-actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, model, threadId } = body;

    // 1. Dapatkan sesi pengguna untuk mendapatkan User ID
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Validasi input dasar
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 });
    }
    if (!model || typeof model !== 'string') {
      return NextResponse.json({ error: "Model is required and must be a string" }, { status: 400 });
    }
    if (!threadId || typeof threadId !== 'string') {
      return NextResponse.json({ error: "threadId is required and must be a string" }, { status: 400 });
    }

    // 2. Simpan pesan pengguna ke database
    await createMessage({
      role: "user",
      content: text,
      threadSlug: threadId,
      userId: userId,
    });

    const modelName = model === "llama" ? "llama3.2:3b" : "deepseek-r1:7b";

    const stream = await ollama.chat({
      model: modelName,
      messages: [{ role: "user", content: text.trim() }],
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullContent = ""; // Variabel untuk menampung seluruh respons AI

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const part of stream) {
          const chunk = JSON.stringify(part);
          fullContent += part.message.content; // Kumpulkan konten AI
          controller.enqueue(encoder.encode(chunk));
        }
        
        // 3. Setelah stream selesai, simpan pesan dari AI ke database
        if (fullContent.trim()) {
          await createMessage({
            role: "assistant",
            content: fullContent.trim(),
            threadSlug: threadId,
            userId: userId,
          });
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