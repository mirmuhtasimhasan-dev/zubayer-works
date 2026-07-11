"use client";
/**
 * <MotionHover> — drop-in media (video or image) that ripples like liquid on
 * hover, with the distortion SPILLING OUTSIDE its frame.
 *
 *   <MotionHover src="/clip.mp4" type="video" poster="/poster.jpg" className="…" />
 *   <MotionHover src={sanityImageUrl} type="image" className="…" />
 *
 * It renders the plain media first (which is what plays on the server, on touch,
 * with reduced-motion, or when WebGL is unavailable), then overlays a WebGL
 * canvas that is LARGER than the media box (overhangs by `spill`, overflow
 * visible) so the rippled edges bleed beyond the original rectangle. The plane
 * only animates on hover and only while on screen.
 *
 * Note: the media must be same-origin or CORS-enabled (Sanity CDN, most video
 * hosts) to be used as a WebGL texture. YouTube/Vimeo *embeds* can't be textured
 * — pass a direct video-file URL for video mode.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import type { MHControls } from "./MotionHoverGL";

const MotionHoverGL = dynamic(() => import("./MotionHoverGL"), { ssr: false });

export interface MotionHoverProps {
  src: string;
  type?: "video" | "image";
  poster?: string;
  className?: string;
  style?: CSSProperties;
  /** Video playback: "always" (default, muted loop) or "hover" (play on hover). */
  playMode?: "always" | "hover";

  /* ── Tunable feel ── */
  /** Idle ripple when not hovering (0 = calm until hover). */
  ambient?: number;
  /** Distortion strength / amplitude. */
  amplitude?: number;
  /** Noise frequency (low = big swells, high = tight ripples). */
  noiseScale?: number;
  /** Ambient/flow speed. */
  flowSpeed?: number;
  /** How far around the cursor the ripple reaches (uv). */
  mouseRadius?: number;
  /** How far outside the frame it bleeds, as a fraction of the box (each side). */
  spill?: number;
  /** Pointer speed → distortion (higher = triggers with less movement). */
  motionGain?: number;
  /** Seconds to settle back to calm after the pointer stops moving. */
  motionDecay?: number;
  /** How much the WHOLE media warps vs. only right under the cursor (0..1).
   *  Lower = localized/refined; higher = the whole thing swims. */
  base?: number;
  /** How strongly the flow leans toward the cursor (0 = none). */
  pull?: number;
  /** Keep the plain media visible UNDER the GL instead of fading it out. Fills any
   *  edge gap left by the ripple with the crisp media (no empty box behind).
   *  Best for image mode; avoid for video (would show a static duplicate). */
  holdBase?: boolean;
  /** Mount the WebGL canvas only WHILE hovering (not just in view). Use when many
   *  instances share a page (e.g. a gallery) so they don't exhaust the browser's
   *  ~16 WebGL contexts — only the hovered one is live. */
  activateOnHover?: boolean;
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!window.WebGLRenderingContext && !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function MotionHover({
  src,
  type = "image",
  poster,
  className,
  style,
  playMode = "always",
  ambient = 0,
  amplitude = 0.02,
  noiseScale = 3.0,
  flowSpeed = 0.3,
  mouseRadius = 0.4,
  spill = 0.10,
  motionGain = 80,
  motionDecay = 0.22,
  base = 0.3,
  pull = 0.35,
  holdBase = false,
  activateOnHover = false,
}: MotionHoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement & HTMLImageElement>(null);
  const controls = useRef<MHControls>({});

  const [enabled, setEnabled] = useState<boolean | null>(null); // WebGL distortion allowed?
  const [inView, setInView] = useState(false);
  const [glReady, setGlReady] = useState(false); // GL painted → hide the plain media
  const [hovering, setHovering] = useState(false); // for activateOnHover gating
  const leaveTimer = useRef<number | undefined>(undefined);

  // With activateOnHover, the canvas only mounts while the pointer is over it.
  const active = !!enabled && inView && (!activateOnHover || hovering);

  // Detect hover before the canvas mounts (so activateOnHover can gate it). Only
  // needed for that mode; otherwise the active-gated effect below handles hover.
  useEffect(() => {
    if (!activateOnHover || !enabled || !inView) return;
    const el = wrapRef.current;
    if (!el) return;
    const onEnter = () => { window.clearTimeout(leaveTimer.current); setHovering(true); };
    const onLeave = () => {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setHovering(false), 300); // let the ripple settle
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.clearTimeout(leaveTimer.current);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [activateOnHover, enabled, inView]);

  // Decide once: no distortion on reduced-motion, touch/coarse pointer, or no WebGL.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setEnabled(!reduce && !coarse && supportsWebGL());
  }, []);

  // Only mount/animate the canvas while near the viewport.
  useEffect(() => {
    if (enabled === null) return;
    const el = wrapRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  // Keep the <video> playing (muted autoplay) in "always" mode, even as fallback.
  useEffect(() => {
    if (type !== "video") return;
    const v = mediaRef.current;
    if (!v) return;
    v.muted = true;
    if (playMode === "always") v.play?.().catch(() => {});
    else v.pause?.();
  }, [type, playMode]);

  useEffect(() => { if (!active) setGlReady(false); }, [active]);

  // Hover + pointer tracking on the wrapper (the GL overlay is pointer-events:none).
  useEffect(() => {
    if (!active) return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      controls.current.setPointer?.([(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]);
    };
    const onEnter = () => {
      controls.current.setHover?.(true);
      if (type === "video" && playMode === "hover") mediaRef.current?.play?.().catch(() => {});
    };
    const onLeave = () => {
      controls.current.setHover?.(false);
      if (type === "video" && playMode === "hover") mediaRef.current?.pause?.();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [active, type, playMode]);

  const getMedia = useCallback(() => mediaRef.current, []);
  const onFirstFrame = useCallback(() => setGlReady(true), []);

  const wrapStyle = useMemo<CSSProperties>(
    () => ({ position: "relative", overflow: "visible", width: "100%", height: "100%", ...style }),
    [style]
  );
  const mediaStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    // holdBase keeps the crisp media under the GL so a warped edge never reveals
    // the empty box behind; otherwise fade it out once the GL is painting.
    opacity: holdBase ? 1 : glReady ? 0 : 1,
    transition: "opacity .2s ease",
  };

  return (
    <div ref={wrapRef} className={className} style={wrapStyle}>
      {type === "video" ? (
        <video
          ref={mediaRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={playMode === "always"}
          crossOrigin="anonymous"
          preload="auto"
          style={mediaStyle}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={mediaRef} src={src} alt="" crossOrigin="anonymous" style={mediaStyle} />
      )}

      {active && (
        <div
          aria-hidden
          style={{ position: "absolute", inset: `-${spill * 100}%`, overflow: "visible", pointerEvents: "none" }}
        >
          <MotionHoverGL
            getMedia={getMedia}
            type={type}
            controls={controls}
            onFirstFrame={onFirstFrame}
            spill={spill}
            ambient={ambient}
            amplitude={amplitude}
            noiseScale={noiseScale}
            flowSpeed={flowSpeed}
            mouseRadius={mouseRadius}
            motionGain={motionGain}
            motionDecay={motionDecay}
            base={base}
            pull={pull}
            holdBase={holdBase}
          />
        </div>
      )}
    </div>
  );
}
