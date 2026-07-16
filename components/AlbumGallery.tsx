"use client";
import { useCallback, useEffect, useState } from "react";
import { sanityImage, urlFor } from "@/sanity/lib/image";

const GRID_IMG = { widths: [400, 600, 800, 1000], sizes: "(max-width:600px) 48vw, (max-width:1000px) 45vw, 30vw" };

export default function AlbumGallery({
  photos,
  albumTitle,
  albumDescription,
}: {
  photos: any[];
  albumTitle?: string;
  albumDescription?: string;
}) {
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
        {photos.map((p, i) => (
          // No ripple: a plain print that grows with a soft shadow on hover (CSS).
          <button
            className="album-cell"
            key={p._key || i}
            onClick={() => setLb(i)}
            aria-label={p.caption || `Photo ${i + 1}`}
          >
            <img {...sanityImage(p, GRID_IMG)} alt={p.caption || ""} loading="lazy" draggable={false} />
          </button>
        ))}
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
          <figure className="lb-figure lb-figure-row" onClick={(e) => e.stopPropagation()}>
            <img src={urlFor(photos[lb]).width(2000).fit("max").auto("format").url()} alt={photos[lb]?.caption || ""} />
            {/* The photo's own caption wins; with none, the album name + its short
                description stand in, so the panel is never empty. */}
            {photos[lb]?.caption ? (
              <figcaption className="lb-meta">
                <p className="lb-meta-caption">{photos[lb].caption}</p>
              </figcaption>
            ) : (albumTitle || albumDescription) ? (
              <figcaption className="lb-meta">
                {albumTitle && <h2 className="lb-meta-title">{albumTitle}</h2>}
                {albumDescription && <p className="lb-meta-desc">{albumDescription}</p>}
              </figcaption>
            ) : null}
          </figure>
        </div>
      )}
    </>
  );
}
