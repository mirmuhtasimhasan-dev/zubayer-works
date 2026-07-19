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
  /** Force a width/height aspect ratio (e.g. 2 = 2:1) by cropping at the source, so
   *  the delivered file already matches the display box — no runtime object-fit
   *  cropping, which is what keeps a WebGL ripple's frame identical to the plain img. */
  ratio?: number;
  /** Which edge to keep when `ratio` crops (Sanity crop): "bottom" preserves a logo
   *  baked into the foot of the photo. Defaults to "center". */
  crop?: "top" | "bottom" | "left" | "right" | "center" | "focalpoint" | "entropy";
  /** How `ratio` reaches the target box: "crop" (default) fills by cropping;
   *  "fill" fits the WHOLE image in and pads the rest with `bg` (no crop) — right for
   *  a logo you don't want clipped. */
  fit?: "crop" | "fill";
  /** Letterbox colour (hex, no #) used when `fit:"fill"` pads. Match the card so the
   *  padding is invisible, e.g. "010101" (dark card) or "ffffff" (light). */
  bg?: string;
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
  { widths = [480, 768, 1024, 1440, 2000], sizes = "100vw", quality = 90, ratio, crop, fit, bg }: SanityImageOpts = {}
): { src?: string; srcSet?: string; sizes?: string } {
  if (!source) return {};
  if (typeof source === "string") return { src: source }; // already a URL (external/legacy)
  if (!source.asset) return {};
  const url = (w: number) => {
    let b = urlFor(source).width(w).quality(quality).auto("format");
    // With a forced ratio, reach that exact box either by cropping (default) or by
    // fitting the whole image in and padding (fit:"fill"); otherwise cap to source.
    if (ratio) {
      b = b.height(Math.round(w / ratio));
      b = fit === "fill" ? b.fit("fill").bg(bg || "ffffff") : b.fit("crop").crop(crop || "center");
    } else {
      b = b.fit("max");
    }
    return b.url();
  };
  return {
    src: url(widths[widths.length - 1]),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    sizes,
  };
}
