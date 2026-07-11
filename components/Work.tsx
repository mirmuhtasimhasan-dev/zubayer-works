"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
function workKind(w: any, group?: string): "video" | "photo" {
  if (w?.kind === "video" || w?.kind === "photo") return w.kind;
  if (w?.videoEmbed) return "video";
  return group === "Videography" ? "video" : "photo";
}

const LIGHTBOX_IMG = { widths: [1024, 1600, 2000, 2600], sizes: "92vw" };

export default function Work({ featured, eyebrow = "The Eye" }: { featured: any[]; categories?: any[]; eyebrow?: string }) {
  const [lightbox, setLightbox] = useState<{ img?: any; video?: string; videoFile?: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox]);

  const items = (featured || []).filter((f: any) => f && (f.cover || f.image || f.autoThumb));
  if (!items.length) return null;

  const openWork = (w: any, g?: string) => {
    if (w?.videoFile) setLightbox({ videoFile: w.videoFile }); // direct file = high quality
    else if (workKind(w, g) === "video" && w?.videoEmbed) setLightbox({ video: embedUrl(w.videoEmbed) });
    else if (w?.image || w?.cover) setLightbox({ img: w.image || w.cover });
  };

  // Thumbnail for a featured MotionHover — Sanity images are used directly; the
  // auto YouTube thumbnail is routed through /api/img so it can be a WebGL texture.
  const srcOf = (f: any) =>
    f.cover
      ? sanityImage(f.cover, { widths: [1600], sizes: "80vw" }).src
      : f.image
      ? sanityImage(f.image, { widths: [1600], sizes: "80vw" }).src
      : f.autoThumb
      ? `/api/img?url=${encodeURIComponent(f.autoThumb)}`
      : "";

  return (
    <section className="section eye" id="work">
      <Reveal><p className="eyebrow">{eyebrow}</p></Reveal>

      {items.map((f: any, i: number) => {
        const src = srcOf(f);
        const kind = workKind(f, f.categoryGroup);
        // First featured → the full Eye (every category); the rest → their own category.
        const catId = f.categorySlug || f.categoryId;
        const watchHref = i === 0 || !catId ? "/eye" : `/eye/${catId}`;
        return (
          <Reveal key={f.id}>
            <div className={`eye-featured${i > 0 ? " eye-featured-sub" : ""}`}>
              {/* Only the media opens the video — so the "Watch more" link stays a
                  plain, reliable navigation. The thumbnail ripples on hover. */}
              <div
                className="eye-featured-media"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => openWork(f, f.categoryGroup)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openWork(f, f.categoryGroup); }}
              >
                {src && <MotionHover type="image" src={src} style={{ position: "absolute", inset: 0 }} />}
                {kind === "video" && <span className="eye-play" aria-hidden />}
              </div>
              <div className="eye-featured-meta">
                <span className="eye-featured-title">{f.title}</span>
                <Link className="eye-watch-more" href={watchHref}>
                  Watch more <span aria-hidden>&#8594;</span>
                </Link>
              </div>
            </div>
          </Reveal>
        );
      })}

      {/* LIGHTBOX / VIDEO */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" aria-label="Close" onClick={() => setLightbox(null)}>&#10005;</button>
          {lightbox.videoFile ? (
            <video className="eye-videobox" src={lightbox.videoFile} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
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
