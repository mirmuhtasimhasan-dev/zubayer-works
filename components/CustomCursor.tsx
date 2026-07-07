"use client";
import { useEffect, useRef } from "react";

/* ====== CIRCLE SIZE: change ONLY this one number to resize ====== */
const LENS = 96;   // magnifier diameter in px (smaller number = smaller circle)
/* =============================================================== */
const ZOOM = 1.9;                       // how much to zoom the image
const BOX = ".work-media, .g-item";     // only these images get the magnifier

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lens = ref.current;
    if (!lens) return;

    Object.assign(lens.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: LENS + "px",
      height: LENS + "px",
      borderRadius: "50%",
      border: "1px solid rgba(247,244,238,0.6)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
      backgroundRepeat: "no-repeat",
      pointerEvents: "none",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity .18s ease",
      willChange: "transform",
    });

    let img: HTMLImageElement | null = null;
    let box: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let mx = 0;
    let my = 0;
    let raf = 0;

    const paint = () => {
      raf = 0;
      if (!img || !rect) return;
      lens.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      const px = mx - rect.left;
      const py = my - rect.top;
      lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      lens.style.backgroundSize = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
      lens.style.backgroundPosition = `${LENS / 2 - px * ZOOM}px ${LENS / 2 - py * ZOOM}px`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const onMove = (e: MouseEvent) => {
      if (!img) return;
      mx = e.clientX;
      my = e.clientY;
      rect = img.getBoundingClientRect();
      schedule();
    };

    const onOver = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest?.(BOX) as HTMLElement | null;
      if (!b) return;
      const found = b.querySelector("img") as HTMLImageElement | null;
      if (found && found !== img) {
        img = found;
        box = b;
        b.style.cursor = "none";
        rect = found.getBoundingClientRect();
        mx = e.clientX;
        my = e.clientY;
        lens.style.opacity = "1";
        schedule();
      }
    };

    const onOut = (e: MouseEvent) => {
      if (!img) return;
      const b = (e.target as HTMLElement).closest?.(BOX);
      const toBox = (e.relatedTarget as HTMLElement | null)?.closest?.(BOX);
      if (b && toBox !== b) {
        if (box) box.style.cursor = "";
        img = null;
        box = null;
        rect = null;
        lens.style.opacity = "0";
        lens.style.backgroundImage = "none";
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
      if (box) box.style.cursor = "";
    };
  }, []);

  return <div ref={ref} aria-hidden="true" />;
}