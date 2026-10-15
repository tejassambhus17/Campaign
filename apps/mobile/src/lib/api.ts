import { Platform } from "react-native";
let accessToken: string | null = null;
let tokenGeneration = 0;
let sessionExpiredHandler: (() => Promise<void>) | null = null;
let base =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? Platform.OS === "android"
      ? "http://10.0.2.2:8787"
      : "http://127.0.0.1:8787"
    : "");
export const getApiUrl = () => base;
export const normalizeApiUrl = (url: string) => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Enter a complete HTTP or HTTPS backend address.");
  }
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  )
    throw new Error(
      "Use an HTTP or HTTPS backend address without credentials, a query or a fragment.",
    );
  return parsed.href.replace(/\/$/, "");
};
export const setApiUrl = (url: string) => {
  const next = normalizeApiUrl(url);
  if (base !== next) setToken(null);
  base = next;
};
export const setToken = (token: string | null) => {
  accessToken = token;
  tokenGeneration += 1;
};
export const onSessionExpired = (handler: () => Promise<void>) => {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
};
const canReadAsGuest = (path: string) =>
  /^\/campaigns(?:\/[^/?]+(?:\/(?:report|updates))?)?$/.test(path) ||
  /^\/receipts\/[^/?]+\?token=[a-f0-9]{64}$/.test(path);
export const mediaUrl = (url?: string) =>
  url?.startsWith("/") ? `${base}${url}` : url || "";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<T> {
  if (!base)
    throw new Error(
      "Backend address is not configured. Set a reachable HTTPS API address in Settings or EXPO_PUBLIC_API_URL.",
    );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const requestBase = base;
  const requestToken = accessToken;
  const requestGeneration = tokenGeneration;
  const method = (options.method || "GET").toUpperCase();
  try {
    const send = (token: string | null) =>
      fetch(`${requestBase}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          ...(options.form ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body:
          options.form ||
          (options.body === undefined ? undefined : JSON.stringify(options.body)),
      });
    let response = await send(requestToken);
    if (
      response.status === 401 &&
      requestToken &&
      !["/auth/login", "/auth/register"].includes(path)
    ) {
      // A late response from an old session must never sign out a newer one.
      if (requestGeneration === tokenGeneration && requestBase === base) {
        setToken(null);
        await sessionExpiredHandler?.();
      }
      // Retry once, only for explicitly public reads. Mutations and private
      // reads keep their 401; a guest receipt still requires its capability.
      if (
        method === "GET" &&
        options.body === undefined &&
        !options.form &&
        canReadAsGuest(path) &&
        !accessToken &&
        requestBase === base
      )
        response = await send(null);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        "The server returned an unreadable response. Please retry when the connection is stable.",
        response.status,
      );
    }
    if (!response.ok) {
      const detail = data.detail;
      throw new ApiError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail
                .map(
                  (v: { msg: string; loc: string[] }) =>
                    `${v.loc.slice(1).join(".")}: ${v.msg}`,
                )
                .join("\n")
            : typeof detail === "object" && detail
              ? Object.values(detail).join("\n")
              : "The request could not be completed.",
        response.status,
      );
    }
    return data as T;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message === "Failed to fetch" ||
        error.message === "Network request failed")
    )
      throw new Error(
        "We could not reach the server. Your saved work is safe. Check your connection and API address, then retry.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
