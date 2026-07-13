// Same-origin image proxy so external thumbnails (YouTube/Vimeo) can be used as
// WebGL textures — cross-origin images without CORS headers can't be textured
// directly, but a same-origin proxy sidesteps that. Host-allowlisted.
//
// The upstream URL is base64url-encoded into the PATH (see lib/imgProxy.ts). It
// used to be a `?url=` query string, but Netlify's CDN served a single cached
// response for every query string, so every video thumbnail came back as the same
// image in production. A path segment is always part of the cache key.
import { decodeImgSpec } from "@/lib/imgProxy";

const ALLOWED = new Set([
  "img.youtube.com",
  "i.ytimg.com",
  "i.vimeocdn.com",
  "cdn.sanity.io",
]);

export async function GET(_req: Request, { params }: { params: Promise<{ spec: string }> }) {
  const { spec } = await params;
  const url = decodeImgSpec(spec);
  if (!url) return new Response("bad spec", { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:") return new Response("bad protocol", { status: 400 });
  if (!ALLOWED.has(target.hostname)) return new Response("forbidden host", { status: 403 });

  try {
    const upstream = await fetch(target.toString(), { next: { revalidate: 86400 } });
    if (!upstream.ok) return new Response("upstream error", { status: 502 });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
