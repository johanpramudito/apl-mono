import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await prisma.chatSession.findMany({
    where: { id_pengguna: Number(session.user.id) },
    orderBy: { waktu_buat: "desc" },
  });

  return NextResponse.json({ threads });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  if (!title || title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const newThread = await prisma.chatSession.create({
    data: {
      session_id: crypto.randomUUID(),
      judul: title,
      id_pengguna: Number(session.user.id),
    },
  });

  return NextResponse.json({ thread: newThread });
}
