import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getAllPostsExcluding, createPost } from "@/services/posts";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
      const ext = path.extname(file.name) || ".jpg";
      const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      if (!allowedExts.includes(ext.toLowerCase())) {
        return NextResponse.json(
          { error: "Invalid image type" },
          { status: StatusCodes.BAD_REQUEST },
        );
      }
      const filename = `${randomUUID()}${ext}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadsDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
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
