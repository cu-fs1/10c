import { NextResponse } from "next/server";
import { getSession } from "@/lib/api-utils";
import { StatusCodes } from "http-status-codes";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { user: null },
      { status: StatusCodes.UNAUTHORIZED },
    );
  }
  return NextResponse.json(
    { user: session.user, token: session.token },
    { status: StatusCodes.OK },
  );
}
