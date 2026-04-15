import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import * as argon2 from "argon2";
import User, { IUserLean } from "@/models/User";
import "@/lib/db";
import { createAuthCookie } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const user = (await User.findOne({ email }).lean()) as IUserLean | null;
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const response = NextResponse.json(
      { user: { id: user._id.toString(), email: user.email, name: user.name } },
      { status: StatusCodes.OK },
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
