"use client";
import { useEffect, useState } from "react";
import MotionHover from "./MotionHover";
import { sanityImage } from "@/sanity/lib/image";

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

const TILE_WIDTHS = [400, 600, 800, 1000, 1200];
const GRID_SIZES = "(max-width: 600px) 45vw, (max-width: 1000px) 45vw, 30vw";
const LIGHTBOX_IMG = { widths: [1024, 1600, 2000, 2600], sizes: "92vw" };

export default function CategoryWorks({ works, group }: { works: any[]; group?: string }) {
  const [lightbox, setLightbox] = useState<{ img?: any; video?: string; videoFile?: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox]);

  const openWork = (w: any, g?: string) => {
    if (w?.videoFile) setLightbox({ videoFile: w.videoFile });
    else if (workKind(w, g) === "video" && w?.videoEmbed) setLightbox({ video: embedUrl(w.videoEmbed) });
    else if (w?.image || w?.cover) setLightbox({ img: w.image || w.cover });
  };

  const renderWork = (w: any) => {
    const isVideo = workKind(w, group) === "video";
    const wsrc = w.cover
      ? sanityImage(w.cover, { widths: TILE_WIDTHS, sizes: GRID_SIZES }).src
      : w.image
      ? sanityImage(w.image, { widths: TILE_WIDTHS, sizes: GRID_SIZES }).src
      : w.autoThumb
      ? `/api/img?url=${encodeURIComponent(w.autoThumb)}`
      : "";
    return (
      <button key={w.id} className="eye-work" onClick={() => openWork(w, group)}>
        <div className="eye-work-media">
          {wsrc ? (
            <MotionHover
              type="image"
              src={wsrc}
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
          ) : (
            <span className="eye-tile-placeholder">{isVideo ? <VideoIcon /> : <PhotoIcon />}</span>
          )}
          {isVideo && <span className="eye-work-play" aria-hidden />}
        </div>
        <span className="eye-work-title">{w.title}</span>
      </button>
    );
  };

  if (!works?.length) return <p className="eye-empty">No videos in this category yet.</p>;

  return (
    <>
      <div className="eye-grid">{works.map((w) => renderWork(w))}</div>

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
    </>
  );
}
