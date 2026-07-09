"use client";
import { useRef, useState } from "react";
import Reveal from "./Reveal";
import { sanityImage } from "@/sanity/lib/image";

const CARD_IMG = { widths: [220, 320, 440, 560], sizes: "(max-width: 600px) 52vw, 200px" };

export default function Archive({ images, behanceUrl }: { images: any[]; behanceUrl?: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, scroll: 0 });
  const [dragging, setDragging] = useState(false);

  if (!images?.length) return null;

  // Set/change in Studio (Archive Settings → Behance URL); falls back to this.
  const bh = behanceUrl || "https://www.behance.net/zubayerahmed23";

  const nudge = (dir: number) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // Mouse click-and-drag to scroll (touch uses native swipe).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = rowRef.current;
    if (!el) return;
    drag.current = { down: true, moved: false, startX: e.clientX, scroll: el.scrollLeft };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const el = rowRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true;
      setDragging(true);
    }
    el.scrollLeft = drag.current.scroll - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    setDragging(false);
    rowRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <section className="archive" id="gallery">
      <div className="archive-head">
        <Reveal><p className="eyebrow">The Archive</p></Reveal>
        <div className="arch-nav">
          <button className="arch-arrow" aria-label="Scroll left" onClick={() => nudge(-1)}>&#8249;</button>
          <button className="arch-arrow" aria-label="Scroll right" onClick={() => nudge(1)}>&#8250;</button>
        </div>
      </div>

      <div className="arch-rowwrap">
        <div
          ref={rowRef}
          className={`arch-row ${dragging ? "dragging" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {images.map((im) => (
            <div className="arch-card" key={im.id}>
              <div className="arch-card-media">
                {im.image && <img {...sanityImage(im.image, CARD_IMG)} alt={im.title || ""} loading="lazy" draggable={false} />}
              </div>
              {(im.title || im.place) && (
                <div className="arch-card-meta">
                  {im.title && <span className="arch-card-title">{im.title}</span>}
                  {im.place && <span className="arch-card-place">{im.place}</span>}
                </div>
              )}
            </div>
          ))}

          <div className="arch-card arch-end">
            <a
              href={bh}
              target="_blank"
              rel="noopener noreferrer"
              // A drag that moved should not trigger the link.
              onClick={(e) => { if (drag.current.moved) e.preventDefault(); }}
            >
              <span className="arch-end-arrow" aria-hidden>&#8599;</span>
              <span className="arch-end-text">See the full archive on Behance</span>
            </a>
          </div>
        </div>
      </div>

      <div className="arch-foot">
        <a className="arch-behance" href={bh} target="_blank" rel="noopener noreferrer">
          <span className="arch-behance-text">See the full archive on Behance</span>
          <span className="arch-behance-arrow" aria-hidden>&#8599;</span>
        </a>
      </div>
    </section>
  );
}
