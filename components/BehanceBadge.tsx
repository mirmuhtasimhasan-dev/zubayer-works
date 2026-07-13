"use client";
/**
 * <BehanceBadge> — a circular badge whose text spins around the ring, with the
 * Behance mark at its centre. On hover the ring speeds up, the inner disc fills
 * with ink, and the mark inverts to paper.
 *
 * The ring text is a single <textPath> on a circle, with RING_TEXT repeated so it
 * wraps the full circumference with no seam. It is decorative — the accessible
 * name lives on the <a>.
 *
 * Touch: the disc keeps a visible outline and a gentle spin, plus a pressed state
 * on tap. prefers-reduced-motion: nothing spins.
 */
import { useEffect, useRef } from "react";

/* ─────────────── Tunable ─────────────── */
const BADGE_SIZE = 132; // px across
const SPIN_DURATION = 16; // s — resting rotation
const SPIN_DURATION_HOVER = 6; // s — speeds up under the cursor
const RING_TEXT = "SEE THE FULL ARCHIVE · ON BEHANCE · ";
const DISC_INSET = 18; // px the inner disc sits in from the edge
/* ────────────────────────────────────── */

// The official Behance mark (Simple Icons), inlined so no icon dependency ships.
// fill="currentColor" lets it invert cleanly against the filled disc.
const BEHANCE_PATH =
  "M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z";

export default function BehanceBadge({ href }: { href: string }) {
  const S = BADGE_SIZE;
  const c = S / 2;
  // The circle the text rides on — a little inside the edge so glyphs never clip.
  const textRadius = c - 9;
  const discRadius = c - DISC_INSET;

  const textRef = useRef<SVGTextElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Fit ONE copy of the text to the ring exactly. Repeating it either leaves a gap
  // or laps itself, and SVG textLength is unreliable on <textPath> in Chrome — so
  // measure the path and the text and open the letter-spacing by the difference.
  // Re-run once the display font has loaded, or the measurement is of the fallback.
  useEffect(() => {
    const text = textRef.current;
    const path = pathRef.current;
    if (!text || !path) return;

    const fit = () => {
      const chars = RING_TEXT.length;
      if (!chars) return;
      for (let i = 0; i < 2; i++) {
        // two passes: changing the spacing changes the measured length slightly
        const pathLen = path.getTotalLength();
        const textLen = text.getComputedTextLength();
        if (!pathLen || !textLen) return;
        const current = parseFloat(getComputedStyle(text).letterSpacing) || 0;
        text.style.letterSpacing = `${current + (pathLen - textLen) / chars}px`;
      }
    };

    fit();
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(fit).catch(() => {});
  }, []);

  return (
    <a
      className="bhb"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="See the full archive on Behance"
      style={
        {
          "--bhb-size": `${S}px`,
          "--bhb-spin": `${SPIN_DURATION}s`,
          "--bhb-spin-hover": `${SPIN_DURATION_HOVER}s`,
        } as React.CSSProperties
      }
    >
      {/* Spinning ring text — decorative; the <a> carries the label. */}
      <svg className="bhb-ring" viewBox={`0 0 ${S} ${S}`} aria-hidden="true" focusable="false">
        <defs>
          <path
            ref={pathRef}
            id="bhb-circle"
            fill="none"
            d={`M ${c},${c} m -${textRadius},0 a ${textRadius},${textRadius} 0 1,1 ${
              textRadius * 2
            },0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0`}
          />
        </defs>
        <text ref={textRef} className="bhb-ring-text">
          <textPath href="#bhb-circle" startOffset="0">
            {RING_TEXT}
          </textPath>
        </text>
      </svg>

      {/* Inner disc: hairline at rest, floods with ink on hover. */}
      <svg className="bhb-disc" viewBox={`0 0 ${S} ${S}`} aria-hidden="true" focusable="false">
        <circle className="bhb-disc-fill" cx={c} cy={c} r={discRadius} />
        <circle className="bhb-disc-ring" cx={c} cy={c} r={discRadius} />
      </svg>

      <svg className="bhb-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={BEHANCE_PATH} fill="currentColor" />
      </svg>
    </a>
  );
}
