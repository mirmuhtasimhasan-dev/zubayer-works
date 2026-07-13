/**
 * Same-origin proxy URL for an external thumbnail (YouTube / Vimeo), so it can be
 * used as a WebGL texture (cross-origin images without CORS headers cannot be).
 *
 * The upstream URL is carried in the PATH, not a query string. Netlify's CDN was
 * serving one cached response for every `?url=...`, so every video thumbnail came
 * back as the same image in production. A path segment is always part of the cache
 * key, so each thumbnail is cached and served separately.
 */
export function encodeImgSpec(url: string): string {
  const b64 = typeof window === "undefined" ? Buffer.from(url, "utf8").toString("base64") : btoa(url);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // base64url
}

export function decodeImgSpec(spec: string): string | null {
  try {
    const b64 = spec.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return typeof window === "undefined"
      ? Buffer.from(pad, "base64").toString("utf8")
      : atob(pad);
  } catch {
    return null;
  }
}

/** `/api/img/<base64url of the upstream URL>` — empty string if there is no url. */
export function imgProxy(url?: string | null): string {
  if (!url) return "";
  return `/api/img/${encodeImgSpec(url)}`;
}
