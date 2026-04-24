import { NextResponse } from "next/server";
import * as authApi from "../../../../lib/api/auth";
import { respond } from "../../../../lib/routeUtils";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { password, oldPassword } = body || {};
  if (!password || password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const result = await authApi.resetPassword({ password, oldPassword });
  return respond(result);
}
