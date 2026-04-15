import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import * as argon2 from "argon2";
import User from "@/models/User";
import "@/lib/db";
import { createAuthCookie } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const hashedPassword = await argon2.hash(password);
    const user = await User.create({
      name: name || email,
      email,
      password: hashedPassword,
    });

    const response = NextResponse.json(
      { user: { id: user._id, email: user.email, name: user.name } },
      { status: StatusCodes.CREATED },
    );
    await createAuthCookie(response, user);
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
