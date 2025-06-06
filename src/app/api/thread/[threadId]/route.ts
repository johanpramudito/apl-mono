import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessagesForThread as getMessagesPrisma } from "@/lib/prisma-actions";

export async function GET(
  request: NextRequest,
  context: { params: { threadId: string } }
) {
  // 1. Get the threadId from the context object
  const { threadId } = context.params;
  
  // 2. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Validate the threadId
  if (!threadId) {
    return NextResponse.json(
      { error: "Thread ID is required" },
      { status: 400 }
    );
  }

  // 4. Fetch the messages
  try {
    const messages = await getMessagesPrisma(threadId, session.user.id);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(`Failed to fetch messages for thread ${threadId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    const status = errorMessage.includes("Not authorized") ? 403 
                 : errorMessage.includes("not found") ? 404 
                 : 500;
    
    return NextResponse.json({ error: errorMessage }, { status });
  }
}