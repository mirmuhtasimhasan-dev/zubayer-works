"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WorkDetail({ project }: { project: any }) {
  const images: string[] = project.images || [];
  const hasVideo = Boolean(project.videoEmbed);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((v) => (v - 1 + images.length) % images.length);
  const next = () => setIndex((v) => (v + 1) % images.length);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, images.length]);

  return (
    <article className="work-detail">
      <Link href="/#work" className="post-back">← The Eye</Link>
      <p className="post-cat">{project.category}</p>
      <h1 className="post-title">{project.title}</h1>
      {project.description && <p className="work-detail-desc">{project.description}</p>}

      {hasVideo && (
        <div className="work-detail-video">
          <iframe src={project.videoEmbed} allow="autoplay; fullscreen" allowFullScreen />
        </div>
      )}

      {images.length > 0 && (
        <div className="work-detail-grid" style={{ marginTop: hasVideo ? 48 : 0 }}>
          {images.map((src, i) => (
            <button key={i} className="wd-item" onClick={() => { setIndex(i); setOpen(true); }}>
              <img src={src} alt={`${project.title} ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <button className="lb-arrow left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="lb-arrow right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </article>
  );
}
