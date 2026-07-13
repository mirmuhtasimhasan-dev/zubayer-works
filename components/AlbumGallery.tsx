"use client";
import { useCallback, useEffect, useState } from "react";
import MotionHover from "./MotionHover";
import { sanityImage, urlFor } from "@/sanity/lib/image";

const GRID_IMG = { widths: [400, 600, 800, 1000], sizes: "(max-width:600px) 48vw, (max-width:1000px) 45vw, 30vw" };

export default function AlbumGallery({ photos }: { photos: any[] }) {
  const [lb, setLb] = useState<number | null>(null);

  const close = useCallback(() => setLb(null), []);
  const step = useCallback(
    (d: number) => setLb((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, close, step]);

  if (!photos?.length) return <p className="eye-empty">No photos in this album yet.</p>;

  return (
    <>
      <div className="album-grid">
        {photos.map((p, i) => {
          const src = sanityImage(p, GRID_IMG).src || "";
          return (
            <button
              className="album-cell"
              key={p._key || i}
              onClick={() => setLb(i)}
              aria-label={p.caption || `Photo ${i + 1}`}
            >
              {/* Featured-style liquid ripple on hover — canvas only mounts while
                  hovered (activateOnHover) so a big album never runs out of WebGL. */}
              <MotionHover
                type="image"
                src={src}
                holdBase
                activateOnHover
                amplitude={0.05}
                spill={0.06}
                noiseScale={3}
                mouseRadius={0.42}
                motionGain={90}
                motionDecay={0.2}
                base={0.32}
                pull={0.3}
                style={{ position: "absolute", inset: 0 }}
              />
            </button>
          );
        })}
      </div>

      {lb !== null && (
        <div className="lightbox lightbox-light" onClick={close}>
          <button className="lb-close" aria-label="Close" onClick={close}>&#10005;</button>
          {photos.length > 1 && (
            <>
              <button className="lb-arrow left" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>&#8249;</button>
              <button className="lb-arrow right" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>&#8250;</button>
            </>
          )}
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
            <img src={urlFor(photos[lb]).width(2000).fit("max").auto("format").url()} alt={photos[lb]?.caption || ""} />
            {photos[lb]?.caption && <figcaption>{photos[lb].caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
