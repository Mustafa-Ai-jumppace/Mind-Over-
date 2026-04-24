import { NextResponse } from "next/server";
import * as authApi from "../../../../lib/api/auth";
import { clearSessionCookie } from "../../../../lib/session";

export async function POST() {
  await authApi.logout();
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
