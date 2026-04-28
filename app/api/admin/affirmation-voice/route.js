import { NextResponse } from "next/server";
import { getBackendBaseUrl, readSessionToken } from "../../../../lib/backend";

/**
 * Stream affirmation voice from the real API with the admin JWT.
 * Browser <audio> cannot send Authorization; same-origin proxy fixes that.
 */
export async function GET(request) {
  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pathQ = searchParams.get("path");
  const srcQ = searchParams.get("src");

  const base = getBackendBaseUrl().replace(/\/+$/, "");
  let target = "";

  if (pathQ) {
    let p = pathQ;
    try {
      p = decodeURIComponent(pathQ);
    } catch {
      return NextResponse.json({ message: "Invalid path." }, { status: 400 });
    }
    p = p.trim();
    if (!p.startsWith("/") || p.includes("..")) {
      return NextResponse.json({ message: "Invalid path." }, { status: 400 });
    }
    if (p.length > 900) {
      return NextResponse.json({ message: "Path too long." }, { status: 400 });
    }
    target = `${base}${p}`;
  } else if (srcQ) {
    let s = srcQ;
    try {
      s = decodeURIComponent(srcQ);
    } catch {
      return NextResponse.json({ message: "Invalid src." }, { status: 400 });
    }
    s = s.trim();
    if (!s.startsWith(`${base}/`) && s !== base) {
      return NextResponse.json({ message: "URL not allowed." }, { status: 400 });
    }
    if (s.length > 2048) {
      return NextResponse.json({ message: "URL too long." }, { status: 400 });
    }
    target = s;
  } else {
    return NextResponse.json(
      { message: "Missing path or src query." },
      { status: 400 }
    );
  }

  const auth = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: { Authorization: auth, Accept: "*/*" },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    return NextResponse.json({ message: "Could not reach file." }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { message: `Voice request failed (${upstream.status}).` },
      { status: upstream.status === 404 ? 404 : 502 }
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=120",
    },
  });
}
