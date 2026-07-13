"use client";
/**
 * <MagneticButton> — an ink pill that physically LEANS toward the cursor when it
 * comes near, and springs back when it leaves.
 *
 *   <MagneticButton href={url} label="Read everything on Substack" />
 *
 * The pull is proportional to the cursor's offset from the button's centre and
 * fades to nothing at the edge of MAGNET_RADIUS, so it engages smoothly instead
 * of snapping. The arrow inside moves a SMALLER fraction, so the contents lag a
 * beat behind the pill — that lag is what sells it.
 *
 * Transform only (never layout), driven by requestAnimationFrame. On touch or
 * with reduced motion it is simply a static pill — no magnetism, full tap target.
 */
import { useEffect, useRef, useState } from "react";

/* ─────────────── Tunable ─────────────── */
const MAGNET_RADIUS = 90; // px of reach beyond the button's edge
const MAGNET_STRENGTH_X = 0.28; // fraction of the cursor's x offset
const MAGNET_STRENGTH_Y = 0.45; // fraction of the cursor's y offset
const INNER_STRENGTH = 0.1; // the contents lag: a smaller fraction
const SPRING_DURATION = 500; // ms to spring home
const SPRING_EASE = "cubic-bezier(.2, 1.2, .3, 1)";
const TRACK_EASE = "0.12s ease-out"; // snappy while magnetised
/* ────────────────────────────────────── */

interface Props {
  href: string;
  label: string;
  className?: string;
  /** External links open in a new tab; set false for in-site links. */
  external?: boolean;
}

export default function MagneticButton({ href, label, className, external = true }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [magnetic, setMagnetic] = useState(false);

  // Fine pointer + motion allowed, or it is just a normal button.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMagnetic(mq.matches && !reduce.matches);
    update();
    mq.addEventListener?.("change", update);
    reduce.addEventListener?.("change", update);
    return () => {
      mq.removeEventListener?.("change", update);
      reduce.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!magnetic) return;
    const link = linkRef.current;
    const inner = innerRef.current;
    if (!link || !inner) return;

    let raf = 0;
    let engaged = false;
    const target = { x: 0, y: 0 };
    const pointer = { x: -9999, y: -9999 };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };

    const tick = () => {
      const r = link.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      // Distance from the cursor to the button's RECT (0 when it is over it), so
      // the field surrounds the pill rather than radiating from a single point.
      const dxEdge = Math.max(r.left - pointer.x, 0, pointer.x - r.right);
      const dyEdge = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom);
      const distToRect = Math.hypot(dxEdge, dyEdge);

      // 1 when the cursor is on the pill, easing to 0 at the edge of the radius.
      const pull = Math.max(0, 1 - distToRect / MAGNET_RADIUS);
      const near = pull > 0;

      if (near !== engaged) {
        engaged = near;
        // Track snappily while reaching; spring home once released.
        const ease = engaged ? TRACK_EASE : `${SPRING_DURATION}ms ${SPRING_EASE}`;
        link.style.transition = `transform ${ease}`;
        inner.style.transition = `transform ${ease}`;
      }

      target.x = near ? (pointer.x - cx) * MAGNET_STRENGTH_X * pull : 0;
      target.y = near ? (pointer.y - cy) * MAGNET_STRENGTH_Y * pull : 0;

      link.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      // The contents follow the same direction, but less — they lag behind.
      inner.style.transform = `translate3d(${target.x * INNER_STRENGTH}px, ${target.y * INNER_STRENGTH}px, 0)`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      link.style.transform = "";
      link.style.transition = "";
      inner.style.transform = "";
      inner.style.transition = "";
    };
  }, [magnetic]);

  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    // The wrapper holds the layout; only the link inside is ever transformed, so
    // the pill can lean without shifting anything around it.
    <div ref={wrapRef} className={`mag-wrap ${className || ""}`}>
      <a ref={linkRef} className="mag-btn" href={href} {...ext}>
        <span ref={innerRef} className="mag-btn-inner">
          <span className="mag-btn-label">{label}</span>
          <span className="mag-btn-arrow" aria-hidden>&#8599;</span>
        </span>
      </a>
    </div>
  );
}
