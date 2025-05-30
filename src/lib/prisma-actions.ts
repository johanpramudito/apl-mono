// lib/db/prisma-actions.ts
import { prisma } from "@/lib/db";

// ✅ Create new thread
export async function createThread(userId: number) {
  const thread = await prisma.chatSession.create({
    data: {
      session_id: crypto.randomUUID(),
      id_pengguna: userId,
    },
  });
  return thread.session_id;
}

// ✅ Create message
export async function createMessage({
  role,
  content,
  threadSlug,
  userId,
}: {
  role: "user" | "assistant";
  content: string;
  threadSlug: string;
  userId: number;
}) {
  const thread = await prisma.chatSession.findUnique({
    where: { session_id: threadSlug },
  });

  if (!thread) throw new Error("Thread not found");

  const message = await prisma.pesan.create({
    data: {
      isi_pesan: content,
      peran: role,
      id_pengguna: userId,
      chatSessionId_session: thread.id_session,
    },
  });

  return message.id_pesan;
}

// ✅ Get messages by thread
export async function getMessagesForThread(threadSlug: string, userId: number) {
  const thread = await prisma.chatSession.findUnique({
    where: { session_id: threadSlug },
  });

  if (!thread || thread.id_pengguna !== userId) {
    throw new Error("Thread not found or not authorized");
  }

  const messages = await prisma.pesan.findMany({
    where: {
      chatSessionId_session: thread.id_session,
    },
    orderBy: { waktu_buat: "asc" },
  });

  return messages;
}

// ✅ Get all threads for user
export async function getThreadsForUser(userId: number) {
  return await prisma.chatSession.findMany({
    where: {
      id_pengguna: userId,
    },
    orderBy: { waktu_buat: "desc" },
  });
}
