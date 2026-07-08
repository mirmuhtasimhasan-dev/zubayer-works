// Same-origin image proxy so external thumbnails (YouTube/Vimeo) can be used as
// WebGL textures — cross-origin images without CORS headers can't be textured
// directly, but a same-origin proxy sidesteps that. Host-allowlisted.
const ALLOWED = new Set([
  "img.youtube.com",
  "i.ytimg.com",
  "i.vimeocdn.com",
  "cdn.sanity.io",
]);

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!ALLOWED.has(target.hostname)) return new Response("forbidden host", { status: 403 });

  try {
    const upstream = await fetch(target.toString(), { next: { revalidate: 86400 } });
    if (!upstream.ok) return new Response("upstream error", { status: 502 });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
