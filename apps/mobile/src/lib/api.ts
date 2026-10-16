import { Platform } from "react-native";
let accessToken: string | null = null;
let tokenGeneration = 0;
let sessionExpiredHandler: (() => Promise<void>) | null = null;
const sessionListeners = new Set<() => void>();
export const isCloudBuild = process.env.EXPO_PUBLIC_CLOUD_BUILD === "1";
export const normalizeCloudApiUrl = (value: string) => {
  let parsed: URL;
  try { parsed = new URL(value.trim()); } catch { throw new Error("Cloud builds require a public HTTPS backend address."); }
  const host = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || value.includes("?") || value.includes("#") ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
    /(?:^|\.)(?:localhost|local|localdomain|internal|test|invalid|example|lan|home|intranet|onion|arpa)$/.test(host) ||
    /(?:^|\.)example\.(?:com|net|org)$/.test(host))
    throw new Error("Cloud builds require a public HTTPS hostname without credentials, a query or a fragment.");
  return parsed.href.replace(/\/$/, "");
};
let base: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? Platform.OS === "android"
      ? "http://10.0.2.2:8787"
      : "http://127.0.0.1:8787"
    : "");
if (isCloudBuild) base = normalizeCloudApiUrl(base);
export const getApiUrl = () => base;
// SecureStore keys allow only alphanumerics, '.', '-' and '_'. Hex encoding
// preserves the complete server/base-path identity without a hash collision.
const cloudStorageSuffix = () => Array.from(base).map((value) => value.charCodeAt(0).toString(16).padStart(4, "0")).join("");
export const getSessionStorageKey = () => isCloudBuild ? `campaign-session-cloud-${cloudStorageSuffix()}` : "campaign-session";
export const draftStorageKey = (scope: string) => isCloudBuild
  ? `campaign-creation-v1:cloud:${cloudStorageSuffix()}:${scope}`
  : `campaign-creation-v1:${scope}`;
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
  const next = isCloudBuild ? normalizeCloudApiUrl(url) : normalizeApiUrl(url);
  if (isCloudBuild && next !== base) throw new Error("This build uses its configured Campaign HTTPS backend.");
  if (base !== next) setToken(null);
  base = next;
};
export const setToken = (token: string | null) => {
  accessToken = token;
  tokenGeneration += 1;
  sessionListeners.forEach((listener) => listener());
};
export const subscribeApiSession = (listener: () => void) => {
  sessionListeners.add(listener);
  return () => { sessionListeners.delete(listener); };
};
export const getApiSessionGeneration = () => tokenGeneration;
// Capture before an account-scoped picker/request. A later sign-in (even to the
// same account), expiry or backend change makes its pending result obsolete.
export const captureApiSession = () => {
  const generation = tokenGeneration;
  const server = base;
  return () => generation === tokenGeneration && server === base;
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
/** Only the exact API media proxy may receive the current account's bearer. */
const mediaViewEpoch = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const mediaImageSource = (value: string): { uri: string; cache?: "reload"; headers?: { Authorization: string } } => {
  const uri = mediaUrl(value);
  try {
    const target = new URL(uri);
    const server = new URL(base);
    const prefix = server.pathname.replace(/\/$/, "");
    if (target.origin === server.origin && !target.username && !target.password && !value.includes("@") && !value.includes("?") && !value.includes("#") &&
      new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/media/img_[a-f0-9]{24}\\.jpg$`).test(target.pathname)) {
      // Android does not honor every iOS Image cache option. A non-secret,
      // process/session-specific URI also separates native cache entries after
      // logout, account replacement and a fresh app process.
      return { uri: `${uri}?view=${mediaViewEpoch}-${tokenGeneration}`, cache: "reload" as const, ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}) };
    }
  } catch { /* Local picker/data/third-party sources never receive a bearer. */ }
  return { uri };
};
export const requestTimeoutMs = isCloudBuild ? 90_000 : 15_000;
/** RN Web's Image does not forward headers; keep private bytes in a short-lived blob. */
export async function loadPrivateWebImage(value: string, signal: AbortSignal) {
  const source = mediaImageSource(value);
  if (!source.headers || typeof URL.createObjectURL !== "function")
    throw new Error("An authenticated browser image source is unavailable.");
  const current = captureApiSession();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort);
  if (signal.aborted) controller.abort();
  const timer = setTimeout(abort, requestTimeoutMs);
  try {
    const response = await fetch(source.uri, { headers: source.headers, signal: controller.signal, cache: "no-store", credentials: "omit", redirect: "error" });
    if (!response.ok) throw new Error("This campaign image is unavailable.");
    const blob = await response.blob();
    if (!current() || controller.signal.aborted) throw new Error("The image request changed.");
    if (!blob.type.startsWith("image/")) throw new Error("The server returned an invalid image.");
    const uri = URL.createObjectURL(blob);
    let disposed = false;
    return { uri, dispose: () => { if (!disposed) { disposed = true; URL.revokeObjectURL(uri); } } };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
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
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
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
        isCloudBuild
          ? `Campaign is taking longer to connect. Free hosting may be waking up. Your device drafts are safe. Check your connection, then retry.${method === "GET" || method === "HEAD" ? "" : " A payment or submission result may still be pending; refresh its status before trying again."}`
          : "We could not reach the server. Your saved work is safe. Check your connection and API address, then retry.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
