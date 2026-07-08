import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

interface SanityImageOpts {
  /** Candidate widths (px) for the srcSet. The browser picks by slot × DPR. */
  widths?: number[];
  /** The CSS `sizes` attribute describing the display width at each breakpoint. */
  sizes?: string;
  /** JPEG/WebP/AVIF quality. */
  quality?: number;
}

/**
 * Build optimized <img> props (src + retina-aware srcSet + sizes) from a Sanity
 * image. Serves auto WebP/AVIF, correctly sized to the display container, at the
 * requested quality, never upscaled beyond the source (fit=max). Spread the
 * result straight onto an <img>:
 *
 *   <img {...sanityImage(item.cover, { widths: [768,1200,2000], sizes: "56vw" })} alt="…" />
 */
export function sanityImage(
  source: any,
  { widths = [480, 768, 1024, 1440, 2000], sizes = "100vw", quality = 90 }: SanityImageOpts = {}
): { src?: string; srcSet?: string; sizes?: string } {
  if (!source) return {};
  if (typeof source === "string") return { src: source }; // already a URL (external/legacy)
  if (!source.asset) return {};
  const url = (w: number) =>
    urlFor(source).width(w).quality(quality).auto("format").fit("max").url();
  return {
    src: url(widths[widths.length - 1]),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    sizes,
  };
}
