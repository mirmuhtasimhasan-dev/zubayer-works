import { XMLParser } from "fast-xml-parser";

// The client's Substack — "A Shoebox Under the Bed" / "From the shoebox under my bed".
const FEED_URL = "https://scrappyscribbles.substack.com/feed";
export const SUBSTACK_URL = "https://scrappyscribbles.substack.com/";

export interface SubstackPost {
  id: string;
  title: string;
  link: string;
  date: string | null;
  excerpt: string;
  image: string | null;
}

// fast-xml-parser gives CDATA/text nodes as strings or {__cdata|#text}.
function text(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "object") {
    if (typeof v.__cdata === "string") return v.__cdata.trim();
    if (typeof v["#text"] === "string") return String(v["#text"]).trim();
  }
  return String(v).trim();
}

function firstImg(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Substack proxies images through substackcdn; inject a small width so the
// thumbnail isn't the full-resolution original.
function sized(url: string | null, w = 400): string | null {
  if (!url) return null;
  return url.replace(/\/image\/fetch\/([^/]+)\//, (m, params) =>
    /(?:^|,)w_\d/.test(params) ? m : `/image/fetch/${params},w_${w},c_limit/`
  );
}

/**
 * Fetch + parse the latest Substack posts. Revalidates hourly so new essays
 * appear automatically without a rebuild; on any failure it returns [] and Next
 * keeps serving the last good cached response.
 */
export async function getSubstackPosts(limit = 8): Promise<SubstackPost[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { "user-agent": "Mozilla/5.0 (compatible; zubayer.works/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata" });
    const data = parser.parse(xml);

    const raw = data?.rss?.channel?.item;
    const items = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items.slice(0, limit).map((it: any, i: number) => {
      const content = text(it["content:encoded"]);
      const desc = text(it.description);
      const enclosure = typeof it.enclosure?.["@_url"] === "string" ? it.enclosure["@_url"] : null;
      const image = sized(enclosure || firstImg(content) || firstImg(desc));
      const excerptRaw = stripHtml(desc) || stripHtml(content);
      const excerpt = excerptRaw.length > 170 ? excerptRaw.slice(0, 170).trimEnd() + "…" : excerptRaw;
      return {
        id: text(it.guid) || text(it.link) || String(i),
        title: text(it.title) || "Untitled",
        link: text(it.link) || SUBSTACK_URL,
        date: text(it.pubDate) || null,
        excerpt,
        image,
      };
    });
  } catch {
    return [];
  }
}
