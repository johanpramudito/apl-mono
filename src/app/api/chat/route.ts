import { NextRequest } from "next/server";
import ollama from "ollama";

export async function POST(req: NextRequest) {
  const { text, model } = await req.json();

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
}
