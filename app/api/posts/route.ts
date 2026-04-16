import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getAllPostsExcluding, createPost } from "@/services/posts";
import { uploadImageToB2 } from "@/lib/b2";

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

  const contentType = req.headers.get("content-type") ?? "";
  let title: string | undefined;
  let description: string | undefined;
  let imageUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    title = formData.get("title")?.toString();
    description = formData.get("description")?.toString();
    const file = formData.get("image");

    if (file && file instanceof File && file.size > 0) {
      try {
        imageUrl = await uploadImageToB2(file);
      } catch {
        return NextResponse.json(
          { error: "Invalid image type" },
          { status: StatusCodes.BAD_REQUEST },
        );
      }
    }
  } else {
    const body = await req.json();
    title = body.title;
    description = body.description;
  }

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const post = await createPost(session.user.id, title, description, imageUrl);
  return NextResponse.json(post, { status: StatusCodes.CREATED });
}
