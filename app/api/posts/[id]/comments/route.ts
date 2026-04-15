import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getCommentsByPost, createComment } from "@/services/comments";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const comments = await getCommentsByPost(id);
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Comment content is required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const comment = await createComment(id, session.user.id, content.trim());
  return NextResponse.json(comment, { status: StatusCodes.CREATED });
}
