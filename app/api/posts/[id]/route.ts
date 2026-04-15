import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getPostByIdPublic, updatePost, deletePost } from "@/services/posts";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await getPostByIdPublic(id);

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: StatusCodes.NOT_FOUND },
    );
  }

  return NextResponse.json(post);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const post = await updatePost(id, session.user.id, title, description);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: StatusCodes.NOT_FOUND });
  }

  return NextResponse.json(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const post = await deletePost(id, session.user.id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: StatusCodes.NOT_FOUND });
  }

  return NextResponse.json({ success: true });
}
