import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/api-utils";
import { getPostsByUser } from "@/services/posts";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "6", 10)),
  );

  const result = await getPostsByUser(session.user.id, page, limit);
  return NextResponse.json(result);
}
