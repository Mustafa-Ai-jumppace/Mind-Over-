import { NextResponse } from "next/server";

/** Convert a backendFetch result into a NextResponse, preserving status. */
export function respond(result) {
  if (!result) {
    return NextResponse.json(
      { message: "No response from backend." },
      { status: 502 }
    );
  }

  const status = result.status && result.status !== 0 ? result.status : result.ok ? 200 : 502;
  const body = result.ok
    ? result.data?.data ?? result.data ?? { ok: true }
    : { message: result.error?.message || "Request failed." };

  return NextResponse.json(body, { status });
}
