import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./backend";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function parseSessionToken(token) {
  if (!token) return null;
  const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
  const payload = decodeJwtPayload(raw);
  if (!payload) return { token: raw, user: null };

  const user = {
    id: payload.sub || payload.id || payload.userId || null,
    email: payload.email || null,
    name: payload.name || payload.fullName || payload.username || null,
    role: payload.role || payload.roles || "admin",
    raw: payload,
  };
  return { token: raw, user };
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return parseSessionToken(raw);
}
