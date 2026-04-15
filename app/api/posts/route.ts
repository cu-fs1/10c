import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getAllPostsExcluding, createPost } from "@/services/posts";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
  );

  const result = await getAllPostsExcluding(page, limit, session.user.id);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const post = await createPost(session.user.id, title, description);
  return NextResponse.json(post, { status: StatusCodes.CREATED });
}
