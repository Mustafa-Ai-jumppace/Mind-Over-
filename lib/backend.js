import { cookies } from "next/headers";

const DEFAULT_BASE_URL = "http://mindover.prodservers.com:9000";
const DEFAULT_API_VERSION = "/api/v1";
const DEFAULT_COOKIE_NAME = "mo_admin_session";

const DEFAULT_DEVICE_INFO = {
  deviceToken:
    "ab6410cf855uy710c7ce43c36e37084a4b5205b0e1608477336023a8520c9f104398f9",
  deviceType: "web",
  deviceBrand: "Web",
  deviceModel: "Mind Over Admin",
  os: { name: "Web", version: "1.0", type: "web" },
  platform: "web",
  appVersion: "1.0.0",
  screenResolution: "1920x1080",
  language: "en-US",
  timezone: "GMT+5",
  fingerprint: "fngrprt_admin_web_dashboard",
  networkInfo: {
    connectionType: "wifi",
    carrier: "Unknown",
    signalStrength: 4,
    networkSpeed: 120,
    isRoaming: false,
    wifiSSID: "Unknown",
    wifiStrength: 78,
  },
  performanceMetrics: {
    memoryUsage: 0,
    batteryLevel: 100,
    networkLatency: 32,
    cpuUsage: 0,
    storageAvailable: 0,
    appPerformance: { startupTime: 0, responseTime: 0, crashCount: 0 },
  },
};

export const SESSION_COOKIE_NAME =
  process.env.ADMIN_SESSION_COOKIE || DEFAULT_COOKIE_NAME;

function getBaseUrl() {
  const raw = process.env.MINDOVER_API_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function getApiVersion() {
  const raw = process.env.MINDOVER_API_VERSION || DEFAULT_API_VERSION;
  const prefixed = raw.startsWith("/") ? raw : `/${raw}`;
  return prefixed.replace(/\/+$/, "");
}

function getInitialToken() {
  return process.env.MINDOVER_INITIAL_TOKEN || "";
}

function getDeviceToken() {
  return (
    process.env.MINDOVER_DEVICE_TOKEN ||
    DEFAULT_DEVICE_INFO.deviceToken
  );
}

function getDeviceInfo() {
  const raw = process.env.MINDOVER_DEVICE_INFO;
  if (raw) return raw;
  return JSON.stringify({
    ...DEFAULT_DEVICE_INFO,
    deviceToken: getDeviceToken(),
  });
}

export function buildUrl(path, query) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${getBaseUrl()}${getApiVersion()}${cleanPath}`;

  if (query && typeof query === "object") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      params.append(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

export async function readSessionToken() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return raw;
}

/**
 * Auth modes per backend contract:
 *   - "bearer": send `auth-token: <BEARER_TOKEN>` (env MINDOVER_INITIAL_TOKEN).
 *               Used for checkBearer routes (login, signup, verify-otp, send-otp,
 *               forget-password).
 *   - "jwt":    send `Authorization: Bearer <JWT>` from the session cookie
 *               (or explicit token). Used for checkAuth routes and every
 *               /admin route (checkAdminAuth).
 *   - "none":   no auth header.
 */
async function resolveAuthHeaders(mode, explicitToken) {
  if (mode === "none") return {};
  if (mode === "bearer") {
    const token = getInitialToken();
    return token ? { "auth-token": token } : {};
  }
  const token = explicitToken ?? (await readSessionToken());
  if (!token) return {};
  const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { Authorization: bearer };
}

function shouldAttachDeviceHeaders(path) {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/signup") ||
    path.startsWith("/auth/auto-login") ||
    path.startsWith("/auth/logout")
  );
}

/**
 * Server-side fetcher for the Mind Over backend.
 *
 * @param {string} path                API path after /api/v1 (e.g. "/auth/login")
 * @param {object} [options]
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method]
 * @param {any}    [options.body]      JSON-serialized or FormData
 * @param {object} [options.query]     Query params
 * @param {object} [options.headers]   Extra headers (override defaults)
 * @param {"bearer"|"jwt"|"none"} [options.auth]  Auth header strategy
 * @param {string} [options.token]     Explicit JWT (for auth="jwt")
 * @param {boolean}[options.throwOnError]
 * @param {number} [options.timeoutMs]
 */
export async function backendFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    query,
    headers = {},
    auth = "jwt",
    token: explicitToken,
    throwOnError = false,
    timeoutMs = 30000,
  } = options;

  const url = buildUrl(path, query);
  const authHeaders = await resolveAuthHeaders(auth, explicitToken);

  const finalHeaders = {
    Accept: "application/json",
    ...authHeaders,
    ...(shouldAttachDeviceHeaders(path)
      ? {
          "x-device-token": getDeviceToken(),
          "x-device-info": getDeviceInfo(),
        }
      : {}),
    ...headers,
  };

  let payload;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || typeof body === "string") {
      payload = body;
      if (body instanceof FormData) {
        delete finalHeaders["Content-Type"];
      }
    } else {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] || "application/json";
      payload = JSON.stringify(body);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    return {
      ok: false,
      status: 0,
      data: null,
      error: {
        message:
          error?.name === "AbortError"
            ? "Request to backend timed out."
            : `Could not reach backend (${error?.message || "network error"}).`,
      },
    };
  }
  clearTimeout(timer);

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  const isOk = response.ok && data?.success !== false;
  const message = isOk ? null : extractErrorMessage(data, response.status);

  const result = {
    ok: isOk,
    status: response.status,
    data,
    error: isOk ? null : { message },
  };

  if (!result.ok && throwOnError) {
    throw new Error(message);
  }
  return result;
}

function extractErrorMessage(data, status) {
  if (!data) return `Request failed with status ${status}.`;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.message)) {
    return data.message
      .map((m) =>
        typeof m === "string" ? m : `${m.field || "field"}: ${m.message || ""}`
      )
      .join(", ");
  }
  if (typeof data.error === "string") return data.error;
  return `Request failed with status ${status}.`;
}

/** Convenience: unwrap the `data` envelope. Returns null on error. */
export async function backendData(path, options) {
  const result = await backendFetch(path, options);
  if (!result.ok) return { ok: false, error: result.error, data: null };
  return { ok: true, error: null, data: result.data?.data ?? result.data };
}
