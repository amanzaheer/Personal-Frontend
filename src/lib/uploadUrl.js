/**
 * Central helper for building URLs to uploaded assets (images, PDFs, etc.).
 * Works in all setups:
 * - Development + local backend → relative URL (/uploads/...) so Vite proxy is used (no CORS).
 * - Development + live backend → full backend URL (backend must allow localhost: see ALLOW_LOCALHOST).
 * - Production + live backend → full backend URL from env.
 *
 * .env:
 * - VITE_API_BASE_URL = backend API URL (e.g. http://localhost:5000/api or https://your-api.com/api)
 * - VITE_UPLOADS_BASE_URL = optional; defaults to API base without /api
 */

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
const uploadsBaseEnv = (import.meta.env.VITE_UPLOADS_BASE_URL || "").trim();
const isDev = import.meta.env.DEV;

function getUploadBaseUrlInternal() {
  if (uploadsBaseEnv) {
    return uploadsBaseEnv.replace(/\/+$/, "");
  }
  const fromApi = apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  if (fromApi) {
    return fromApi;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/**
 * Get the base URL for uploads (no trailing slash).
 * In dev with local backend only: returns "" so relative URLs use Vite proxy.
 */
export function getUploadBaseUrl() {
  if (isDev) {
    const base = getUploadBaseUrlInternal();
    const isLocalBackend =
      !base ||
      base.startsWith("http://localhost") ||
      base.startsWith("http://127.0.0.1") ||
      base.startsWith("https://localhost") ||
      base.startsWith("https://127.0.0.1");
    if (isLocalBackend) {
      return "";
    }
  }
  return getUploadBaseUrlInternal();
}

/**
 * Build URL for an upload path.
 * - Already http(s) → return as-is.
 * - Dev + local backend → relative (/uploads/...) for proxy.
 * - Otherwise → full URL (base + path). Path is normalized.
 */
export function buildUploadUrl(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized) return null;
  const base = getUploadBaseUrl();
  return base ? `${base}/${normalized}` : `/${normalized}`;
}
