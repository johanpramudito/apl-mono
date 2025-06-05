import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessagesForThread as getMessagesPrisma } from "@/lib/prisma-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = params;

  if (!threadId) {
    return NextResponse.json(
      { error: "Thread ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch messages using the Prisma action.
    // session.user.id is the user's numeric ID.
    // threadId is the string UUID of the chat session.
    const messages = await getMessagesPrisma(threadId, session.user.id);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages for thread:", error);
    if (
      error instanceof Error &&
      (error.message.includes("Thread not found") ||
        error.message.includes("not authorized"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}