"use client";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { sanityImage } from "@/sanity/lib/image";
import MotionHover from "./MotionHover";

// Normalize a YouTube/Vimeo URL to an embeddable one.
function embedUrl(url?: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// Explicit kind, else infer from a video URL, else from the group.
function workKind(w: any, group?: string): "video" | "photo" {
  if (w?.kind === "video" || w?.kind === "photo") return w.kind;
  if (w?.videoEmbed) return "video";
  return group === "Videography" ? "video" : "photo";
}

const TILE_WIDTHS = [400, 600, 800, 1000, 1200];
const TILE_SIZES = "(max-width: 600px) 70vw, (max-width: 1000px) 44vw, 300px";
const GRID_SIZES = "(max-width: 600px) 45vw, (max-width: 1000px) 45vw, 30vw";
const LIGHTBOX_IMG = { widths: [1024, 1600, 2000, 2600], sizes: "92vw" };

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="14" height="10" rx="1.5" />
      <path d="M16 10l5-3v10l-5-3z" />
    </svg>
  );
}
function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 18l5-5 4 4 3-3 4 4" />
    </svg>
  );
}

export default function Work({ featured, categories }: { featured: any; categories: any[] }) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ img?: any; video?: string; videoFile?: string } | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const catDrag = useRef({ down: false, moved: false, startX: 0, scroll: 0 });
  const [catDragging, setCatDragging] = useState(false);

  // Phones use the SAME drill-down flow as desktop, only sized down — on mobile
  // the works show as a 2-column grid (never the horizontal slider).
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox]);

  // Track phone width so the works render as a 2-column grid (not the slider).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Premium touch effect: on phones the category tile nearest the row's centre
  // grows and the rest shrink/fade as you swipe — a focused "cover-flow" feel.
  // (Desktop keeps the mouse hover-zoom; this only runs on the mobile slider.)
  useEffect(() => {
    if (!isMobile || activeCat) return;
    const el = sliderRef.current;
    if (!el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      el.querySelectorAll<HTMLElement>(".eye-tile").forEach((tile) => {
        const c = tile.offsetLeft + tile.offsetWidth / 2;
        const dist = Math.min(1, Math.abs(c - mid) / (el.clientWidth * 0.5));
        const media = tile.querySelector<HTMLElement>(".eye-tile-media");
        if (media) media.style.transform = `scale(${(1.05 - dist * 0.2).toFixed(3)})`;
        tile.style.opacity = (1 - dist * 0.5).toFixed(3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.querySelectorAll<HTMLElement>(".eye-tile").forEach((tile) => {
        tile.style.opacity = "";
        const media = tile.querySelector<HTMLElement>(".eye-tile-media");
        if (media) media.style.transform = "";
      });
    };
  }, [isMobile, activeCat, categories]);

  if (!featured && (!categories || categories.length === 0)) return null;

  // Video categories only (Still Photos was removed).
  const cats = (categories || []).filter((c) => c?.group !== "Still Photos");
  const active = activeCat ? cats.find((c) => c.id === activeCat) : null;
  const openWork = (w: any, g?: string) => {
    if (w?.videoFile) setLightbox({ videoFile: w.videoFile }); // direct file = high quality
    else if (workKind(w, g) === "video" && w?.videoEmbed) setLightbox({ video: embedUrl(w.videoEmbed) });
    else if (w?.image || w?.cover) setLightbox({ img: w.image || w.cover });
  };
  const nudge = (dir: number) => {
    const el = sliderRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // One work tile — shared by the drill grid and the drill slider so both look
  // identical. A drag that moved the slider must not open the work.
  const renderWork = (w: any, g?: string) => {
    const isVideo = workKind(w, g) === "video";
    // Thumbnail source (Sanity direct, else YouTube thumb via same-origin proxy).
    const wsrc = w.cover
      ? sanityImage(w.cover, { widths: TILE_WIDTHS, sizes: GRID_SIZES }).src
      : w.image
      ? sanityImage(w.image, { widths: TILE_WIDTHS, sizes: GRID_SIZES }).src
      : w.autoThumb
      ? `/api/img?url=${encodeURIComponent(w.autoThumb)}`
      : "";
    return (
      <button
        key={w.id}
        className="eye-work"
        onClick={() => { if (!catDrag.current.moved) openWork(w, g); }}
      >
        <div className="eye-work-media">
          {wsrc ? (
            // Featured-style liquid hover, kept subtle.
            <MotionHover
              type="image"
              src={wsrc}
              holdBase
              amplitude={0.05}
              spill={0.08}
              noiseScale={3}
              mouseRadius={0.4}
              motionGain={95}
              motionDecay={0.18}
              base={0.3}
              pull={0.3}
              style={{ position: "absolute", inset: 0 }}
            />
          ) : (
            <span className="eye-tile-placeholder">{isVideo ? <VideoIcon /> : <PhotoIcon />}</span>
          )}
          {isVideo && <span className="eye-work-play" aria-hidden />}
        </div>
        <span className="eye-work-title">{w.title}</span>
      </button>
    );
  };
  // Mouse click-and-drag to slide (touch uses native scroll).
  const catDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = sliderRef.current;
    if (!el) return;
    // Do NOT capture here — capturing on down swallows the tile's click.
    catDrag.current = { down: true, moved: false, startX: e.clientX, scroll: el.scrollLeft };
  };
  const catMove = (e: React.PointerEvent) => {
    if (!catDrag.current.down) return;
    const el = sliderRef.current;
    if (!el) return;
    const dx = e.clientX - catDrag.current.startX;
    if (!catDrag.current.moved && Math.abs(dx) > 5) {
      catDrag.current.moved = true;
      setCatDragging(true);
      el.setPointerCapture?.(e.pointerId); // capture only once a real drag begins
    }
    el.scrollLeft = catDrag.current.scroll - dx;
  };
  const catUp = (e: React.PointerEvent) => {
    if (!catDrag.current.down) return;
    catDrag.current.down = false;
    setCatDragging(false);
    const el = sliderRef.current;
    if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  const featKind = featured ? workKind(featured, featured.categoryGroup) : null;
  // Thumbnail source for the featured MotionHover. Sanity images are CORS-ok and
  // used directly; the auto YouTube thumbnail is routed through /api/img so it
  // can be used as a WebGL texture (external images aren't CORS-textureable).
  const featuredSrc = featured
    ? featured.cover
      ? sanityImage(featured.cover, { widths: [1600], sizes: "80vw" }).src
      : featured.image
      ? sanityImage(featured.image, { widths: [1600], sizes: "80vw" }).src
      : featured.autoThumb
      ? `/api/img?url=${encodeURIComponent(featured.autoThumb)}`
      : ""
    : "";

  return (
    <section className="section eye" id="work">
      <Reveal><p className="eyebrow">The Eye</p></Reveal>

      {/* FEATURED */}
      {featured && (featured.cover || featured.image || featured.autoThumb) && (
        <Reveal>
          <div
            className="eye-featured"
            role="button"
            tabIndex={0}
            onClick={() => openWork(featured, featured.categoryGroup)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openWork(featured, featured.categoryGroup); }}
          >
            {/* The thumbnail ripples on hover and spills beyond the frame
                (transparent bg, no box). Clicking opens the video. */}
            <div className="eye-featured-media" style={{ overflow: "visible", background: "transparent" }}>
              {featuredSrc && (
                <MotionHover type="image" src={featuredSrc} style={{ position: "absolute", inset: 0 }} />
              )}
              {featKind === "video" && <span className="eye-play" aria-hidden />}
            </div>
            <div className="eye-featured-meta">
              <span className="eye-featured-title">{featured.title}</span>
              {featured.categoryName && <span className="eye-featured-cat">{featured.categoryName}</span>}
            </div>
          </div>
        </Reveal>
      )}

      {/* CATEGORY SLIDER, replaced in place by the drill-down when a category is
          open — same flow on desktop and phones, only sized down. On phones the
          works render as a 2-column grid instead of the horizontal slider. */}
      <div className="eye-area">
        {cats.length === 0 ? (
          <p className="eye-empty">No categories here yet.</p>
        ) : active ? (
          <div className="eye-drill">
            <button className="eye-back" onClick={() => setActiveCat(null)}>&#8249; Back to categories</button>
            <h3 className="eye-drill-title">{active.name}</h3>
            {(active.works?.length ?? 0) === 0 ? (
              <p className="eye-empty">No works in this category yet.</p>
            ) : !isMobile && active.works.length > 3 ? (
              // Desktop, >3 → slide like the category slider (arrows + drag).
              <div className="eye-slider-wrap">
                <button className="eye-arrow left" aria-label="Scroll left" onClick={() => nudge(-1)}>&#8249;</button>
                <div
                  className={`eye-slider ${catDragging ? "dragging" : ""}`}
                  ref={sliderRef}
                  onPointerDown={catDown}
                  onPointerMove={catMove}
                  onPointerUp={catUp}
                  onPointerCancel={catUp}
                  onPointerLeave={catUp}
                >
                  {active.works.map((w: any) => renderWork(w, active.group))}
                </div>
                <button className="eye-arrow right" aria-label="Scroll right" onClick={() => nudge(1)}>&#8250;</button>
              </div>
            ) : (
              // Phones (and desktop ≤3): a clean grid — 2 columns on phones.
              <div className="eye-grid">
                {active.works.map((w: any) => renderWork(w, active.group))}
              </div>
            )}
          </div>
        ) : (
          <div className="eye-slider-wrap">
            {/* Arrows only when there are more categories than fit (> 3). */}
            {cats.length > 3 && (
              <button className="eye-arrow left" aria-label="Scroll left" onClick={() => nudge(-1)}>&#8249;</button>
            )}
            <div
              className={`eye-slider ${catDragging ? "dragging" : ""}`}
              ref={sliderRef}
              onPointerDown={catDown}
              onPointerMove={catMove}
              onPointerUp={catUp}
              onPointerCancel={catUp}
              onPointerLeave={catUp}
            >
              {cats.map((c) => {
                const count = c.works?.length ?? 0;
                return (
                  <button
                    key={c.id}
                    className="eye-tile"
                    // A drag that moved should not open the category.
                    onClick={() => { if (!catDrag.current.moved) setActiveCat(c.id); }}
                  >
                    <div className="eye-tile-media">
                      {c.cover ? (
                        <img {...sanityImage(c.cover, { widths: TILE_WIDTHS, sizes: TILE_SIZES })} alt={c.name} loading="lazy" draggable={false} />
                      ) : (
                        <span className="eye-tile-placeholder"><VideoIcon /></span>
                      )}
                    </div>
                    <span className="eye-tile-name">{c.name}</span>
                    <span className="eye-tile-count">{count} {count === 1 ? "work" : "works"}</span>
                  </button>
                );
              })}
            </div>
            {cats.length > 3 && (
              <button className="eye-arrow right" aria-label="Scroll right" onClick={() => nudge(1)}>&#8250;</button>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX / VIDEO */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" aria-label="Close" onClick={() => setLightbox(null)}>&#10005;</button>
          {lightbox.videoFile ? (
            <video
              className="eye-videobox"
              src={lightbox.videoFile}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : lightbox.video ? (
            <div className="eye-videobox" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`${lightbox.video}${lightbox.video.includes("?") ? "&" : "?"}autoplay=1`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Video"
              />
            </div>
          ) : (
            <img {...sanityImage(lightbox.img, LIGHTBOX_IMG)} alt="" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </section>
  );
}
