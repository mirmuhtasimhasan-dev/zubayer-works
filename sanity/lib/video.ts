// Derive a thumbnail image URL from a YouTube/Vimeo link, so video work items
// don't need a manually uploaded cover. YouTube thumbnails are direct URLs;
// Vimeo needs a small server-side lookup, so getVideoThumbnail is async and is
// resolved at data-fetch time (see queries.ts).

export function parseVideo(url?: string): { platform: "youtube" | "vimeo"; id: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { platform: "youtube", id: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)/);
  if (vm) return { platform: "vimeo", id: vm[1] };
  return null;
}

export function youtubeThumb(id: string, res: "maxres" | "hq" = "maxres") {
  return `https://img.youtube.com/vi/${id}/${res === "maxres" ? "maxresdefault" : "hqdefault"}.jpg`;
}

/**
 * Best available thumbnail URL for a video link, or null if it can't be derived.
 * - YouTube: maxresdefault.jpg when it exists, else hqdefault.jpg (which always does).
 * - Vimeo: thumbnail_large from the public oEmbed-style API.
 * Cached for a day; failures return null so the UI can fall back to a placeholder.
 */
export async function getVideoThumbnail(url?: string): Promise<string | null> {
  const v = parseVideo(url);
  if (!v) return null;

  if (v.platform === "youtube") {
    const maxres = youtubeThumb(v.id, "maxres");
    try {
      const r = await fetch(maxres, { method: "HEAD", next: { revalidate: 86400 } });
      if (r.ok) return maxres;
    } catch {
      /* fall through to hq */
    }
    return youtubeThumb(v.id, "hq");
  }

  // Vimeo
  try {
    const r = await fetch(`https://vimeo.com/api/v2/video/${v.id}.json`, { next: { revalidate: 86400 } });
    if (!r.ok) return null;
    const data = await r.json();
    const item = Array.isArray(data) ? data[0] : null;
    return item?.thumbnail_large || item?.thumbnail_medium || item?.thumbnail_small || null;
  } catch {
    return null;
  }
}
