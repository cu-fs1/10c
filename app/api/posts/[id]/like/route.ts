import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { toggleLike } from "@/services/posts";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const post = await toggleLike(id, session.user.id);

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: StatusCodes.NOT_FOUND },
    );
  }

  return NextResponse.json({ likes: post.likes });
}
