"use client";
/**
 * <CursorDot /> — a small solid dot that trails the mouse with easing, ALONGSIDE
 * the normal arrow cursor (the arrow stays visible; we never set cursor:none).
 * Mount once, site-wide. Desktop / fine-pointer only; renders nothing on touch.
 */
import { useEffect, useRef, useState } from "react";

/* ─────────────── Tunable (edit these) ─────────────── */
const DOT_SIZE = 4; 
const DOT_COLOR = "#000000"; // the dot colour (black)
const LAG = 0.18; // 0..1 easing per frame; smaller = more lag / trailing
const OFFSET_X = 16; // px — resting horizontal offset from the cursor
const OFFSET_Y = 16; // px — resting vertical offset from the cursor
/* ──────────────────────────────────────────────────── */

export default function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Desktop / fine-pointer only.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    let raf = 0;
    let visible = false;
    let started = false;
    // target/pos are the DOT's centre (cursor + the constant offset).
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX + OFFSET_X;
      target.y = e.clientY + OFFSET_Y;
      if (!started) { started = true; pos.x = target.x; pos.y = target.y; } // no fly-in
      if (!visible) { visible = true; dot.style.opacity = "1"; }
    };
    const hide = () => { visible = false; dot.style.opacity = "0"; };

    const tick = () => {
      // Ease toward the target; the constant offset means it rests slightly off
      // the arrow tip even when the mouse is held still.
      pos.x += (target.x - pos.x) * LAG;
      pos.y += (target.y - pos.y) * LAG;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: "50%",
        background: DOT_COLOR,
        pointerEvents: "none",
        zIndex: 10000,
        opacity: 0,
        transition: "opacity .25s ease",
        willChange: "transform",
      }}
    />
  );
}
