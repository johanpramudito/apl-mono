"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ThoughtMessage } from "@/components/ThoughtMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
  thought?: string;
};

const ChatPage = () => {
  const [textInput, setTextInput] = useState("");
  const [streamedThought, setStreamedThought] = useState("");
  const [streamedMessage, setStreamedMessage] = useState("");
  const [model, setModel] = useState("deepseek");
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const threadId = params.threadId as string;

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/thread/${threadId}`); // This requires a dynamic API route
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
        setMessages([]);
      }
    }

    if (threadId) {
      fetchMessages();
    }
  }, [threadId]);

  const handleSubmit = async () => {
    // 1. Kirim pesan ke backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput, model, threadId }),
    });

    setTextInput("");

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let fullThought = "";
    let fullContent = "";
    let outputMode: "think" | "response" = "think";

    // Add the user's message to the state immediately
    // Ensure you have a mechanism to distinguish locally added messages if needed,
    // or wait for a server acknowledgment if critical.
    // For this fix, we focus on the streaming part.
    // Consider adding:
    // setMessages((prev) => [
    //   ...prev,
    //   { role: "user", content: textInput, thought: "" },
    // ]);
    // Note: textInput is cleared right after the fetch call, so capture its value before clearing
    // if you move the user message addition here. Let's assume current behavior of adding
    // user message after stream is intended for now and focus on the error.
    const currentInput = textInput; // Capture current input if adding user message after stream

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      let parsed;
      try {
        // It's possible a chunk might not be a complete JSON object,
        // or the stream might send multiple JSON objects or other text.
        // A more robust solution might involve a streaming JSON parser or
        // ensuring the backend sends clearly delimited JSON chunks (e.g., newline-delimited JSON).
        // For now, we'll stick to parsing each chunk as a self-contained JSON.
        parsed = JSON.parse(chunk);
      } catch (error) {
        console.warn("Invalid JSON chunk:", chunk, error);
        continue; // Skip this chunk if it's not valid JSON
      }

      // **** MODIFICATION START ****
      // Check if parsed and parsed.message exist before accessing content
      if (
        parsed &&
        parsed.message &&
        typeof parsed.message.content === "string"
      ) {
        const content = parsed.message.content as string;

        if (model === "deepseek") {
          if (outputMode === "think") {
            if (!content.includes("<think>") && !content.includes("</think>")) {
              fullThought += content;
            }
            setStreamedThought(fullThought); // Update thought as it streams
            if (content.includes("</think>")) {
              outputMode = "response";
            }
          } else {
            fullContent += content;
            setStreamedMessage((prev) => prev + content);
          }
        } else {
          fullContent += content;
          setStreamedMessage((prev) => prev + content);
        }
      } else if (
        parsed &&
        parsed.done === true &&
        parsed.message === undefined
      ) {
        // Handle potential final non-message chunk from Ollama if model signals 'done' this way
        console.log(
          "Stream part indicates done, but no message content: ",
          parsed
        );
      } else {
        console.warn("Received unexpected chunk structure:", parsed);
      }
      // **** MODIFICATION END ****
    }

    let cleanThought = "";
    if (model === "deepseek") {
      cleanThought = fullThought.replace(/<\/?think>/g, "");
      // setStreamedThought(cleanThought); // This was already being set incrementally
    }

    // 2. Tambahkan ke state lokal
    // Ensure currentInput is used here if textInput was cleared earlier
    setMessages((prev) => [
      ...prev,
      // Use the captured currentInput for the user's message
      { role: "user", content: currentInput, thought: "" },
      { role: "assistant", content: fullContent.trim(), thought: cleanThought },
    ]);

    setStreamedThought("");
    setStreamedMessage("");
  };

  useLayoutEffect(() => {
    scrollToBottomRef.current?.scrollIntoView();
  }, [messages, streamedMessage, streamedThought]);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16 border-b justify-between">
        <h1 className="text-xl font-bold ml-4">AI Chat Dashboard</h1>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="deepseek">DeepSeek</option>
          <option value="llama">LLaMA</option>
        </select>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full relative">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {messages.length === 0 && !streamedMessage && !streamedThought ? (
            <p className="text-muted-foreground text-center mt-20">
              Mulailah percakapan dengan mengetik pesan di bawah ini.
            </p>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  thought={msg.thought}
                />
              ))}
              {streamedThought.trim() && (
                <ThoughtMessage thought={streamedThought} />
              )}
              {streamedMessage && (
                <ChatMessage role="assistant" content={streamedMessage} />
              )}
            </>
          )}
          <div ref={scrollToBottomRef} />
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            className="flex-1 text-3xl font-medium"
            placeholder="Type your message here..."
            rows={5}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          />
          <Button onClick={handleSubmit} type="button">
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
