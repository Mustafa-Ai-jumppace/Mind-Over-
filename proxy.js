import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || "mo_admin_session";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (PUBLIC_PATHS.has(pathname)) {
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
