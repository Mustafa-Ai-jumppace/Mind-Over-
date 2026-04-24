import { NextResponse } from "next/server";
import * as authApi from "../../../../lib/api/auth";
import { setSessionCookie } from "../../../../lib/session";

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

  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const result = await authApi.login({ email, password });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.error?.message || "Login failed." },
      { status: result.status && result.status !== 0 ? result.status : 502 }
    );
  }

  const payload = result.data?.data || result.data || {};
  const token =
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    null;
  const user = payload.user || null;

  if (!token) {
    return NextResponse.json(
      { message: "Login succeeded but no token was returned." },
      { status: 502 }
    );
  }

  if (user && user.type && user.type.toLowerCase() !== "admin") {
    return NextResponse.json(
      {
        message:
          "This account is not an admin. Please sign in with an admin account.",
      },
      { status: 403 }
    );
  }

  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: user
      ? {
          id: user._id || user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          profilePicture: user.profilePicture,
          isNotificationEnabled: user.isNotificationEnabled,
        }
      : null,
  });
}
