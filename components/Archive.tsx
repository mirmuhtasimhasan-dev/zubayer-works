"use client";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

function GItem({ img, onClick, delay }: { img: any; onClick: () => void; delay: number; }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return (
    <button ref={ref} className={`g-item ${vis ? "in" : ""}`} style={{ transitionDelay: `${delay}s` }} onClick={onClick}>
      <img src={img.src} alt={img.caption || ""} loading="lazy" />
      {img.caption && <span className="g-cap">{img.caption}</span>}
    </button>
  );
}

export default function Archive({ images }: { images: any[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!images?.length) return null;
  const cols: any[][] = [[], [], []];
  images.forEach((im, i) => cols[i % 3].push({ ...im, _i: i }));
  const show = (i: number) => { setIndex(i); setOpen(true); };
  const close = () => setOpen(false);
  const prev = () => setIndex(v => (v - 1 + images.length) % images.length);
  const next = () => setIndex(v => (v + 1) % images.length);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, images.length]);
  return (
    <section className="archive" id="gallery">
      <div className="archive-head"><Reveal><p className="eyebrow">The Archive</p></Reveal></div>
      <div className="strip">
        {cols.map((col, c) => (
          <div className="col" key={c}>
            {col.map((im) => (<GItem key={im._i} img={im} onClick={() => show(im._i)} delay={c * 0.1} />))}
          </div>
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={close}>
          <button className="lb-arrow left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={images[index].src} alt={images[index].caption || ""} onClick={(e) => e.stopPropagation()} />
          <button className="lb-arrow right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </section>
  );
}
