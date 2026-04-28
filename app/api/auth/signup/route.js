import { NextResponse } from "next/server";
import * as authApi from "../../../../../lib/api/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const { name, email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const result = await authApi.signup({ name, email, password });
  if (!result.ok) {
    return NextResponse.json(
      { message: result.error?.message || "Signup failed." },
      { status: result.status && result.status !== 0 ? result.status : 502 }
    );
  }

  return NextResponse.json(result.data?.data ?? result.data ?? { ok: true });
}

