import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { StatusCodes } from "http-status-codes";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: StatusCodes.OK },
  );

  response.headers.append(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: -1,
      path: "/",
    }),
  );

  return response;
}
