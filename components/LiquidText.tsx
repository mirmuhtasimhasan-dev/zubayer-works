"use client";
/**
 * <LiquidText> — drop-in heading that renders a WebGL liquid/water distortion
 * over otherwise-normal text.
 *
 *   <LiquidText as="h1" className="op-head" text={headline} entranceDelay={1.2} />
 *
 * It renders the real text as plain, crisp HTML (what the server sends, what
 * screen readers read, and what you get with no WebGL or prefers-reduced-motion).
 * On capable clients it overlays a canvas that draws the *same* text — same
 * computed font/colour/line-height — and warps it like liquid: a continuous
 * ambient flow that intensifies and leans toward the cursor, plus a one-time
 * entrance warp that settles into calm.
 *
 * Performance: the WebGL bundle is code-split (ssr:false), and the canvas is
 * only mounted while the heading is near the viewport (IntersectionObserver) —
 * scrolling the hero away unmounts it, freeing the GPU and pausing the loop.
 */
import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import dynamic from "next/dynamic";
import { PAD_EM, type LiquidControls } from "./LiquidTextGL";

const LiquidTextGL = dynamic(() => import("./LiquidTextGL"), { ssr: false });

export interface LiquidTextHandle {
  node: HTMLElement | null;
}

interface LiquidTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** React to the pointer moving over the heading (default true). */
  hover?: boolean;
  /** Seconds to wait before revealing the heading + playing the liquid entrance. */
  entranceDelay?: number;
  /** Fired once the word-by-word entrance has fully finished (or, in the plain
   *  fallback, shortly after it would have). Use to sequence following content. */
  onRevealComplete?: () => void;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const LiquidText = forwardRef<LiquidTextHandle, LiquidTextProps>(function LiquidText(
  { text, as = "span", className, style, hover = true, entranceDelay = 0, onRevealComplete },
  ref
) {
  const rootRef = useRef<HTMLElement>(null);
  const controls = useRef<LiquidControls>({});

  // null = undecided (first render) so .op-head's opacity:0 keeps it hidden and
  // there's no crisp flash before we know whether WebGL/entrance will run.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const [glHidden, setGlHidden] = useState(false); // hide DOM text (canvas is painting)
  const [revealed, setRevealed] = useState(false); // entrance has started

  const active = !!enabled && inView;

  useImperativeHandle(ref, () => ({ node: rootRef.current }), []);

  // Decide once, on the client, whether WebGL should run at all.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduce && supportsWebGL());
  }, []);

  // Mount the canvas only while the heading is near the viewport.
  useEffect(() => {
    if (!enabled) return;
    const el = rootRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  // When the canvas unmounts (scrolled away), un-hide the DOM text again.
  useEffect(() => {
    if (!active) setGlHidden(false);
  }, [active]);

  // Reveal + play the word-by-word entrance after the configured delay.
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      setRevealed(true);
      controls.current.reveal?.();
    }, entranceDelay * 1000);
    return () => window.clearTimeout(id);
  }, [active, entranceDelay]);

  // Fallback (no WebGL / reduced-motion): the plain text is shown immediately,
  // so signal "reveal complete" shortly after the delay to keep sequencing.
  useEffect(() => {
    if (enabled !== false || !onRevealComplete) return;
    const id = window.setTimeout(onRevealComplete, (entranceDelay + 0.4) * 1000);
    return () => window.clearTimeout(id);
  }, [enabled, entranceDelay, onRevealComplete]);

  // Motion-reactive warp for BOTH mouse and touch: pointer events cover mouse,
  // pen and finger, so a finger drag over the heading warps it on mobile just
  // like moving the cursor does on desktop.
  useEffect(() => {
    if (!active || !hover) return;
    const el = rootRef.current;
    if (!el) return;
    const toUv = (e: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    const onMove = (e: PointerEvent) => controls.current.setPointer?.(toUv(e));
    const onEnd = () => controls.current.clearPointer?.();
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointerleave", onEnd);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onEnd);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
    };
  }, [active, hover]);

  const getEl = useCallback(() => rootRef.current, []);
  const onActive = useCallback(() => setGlHidden(true), []);

  const rootStyle = useMemo<CSSProperties>(() => {
    // undecided -> leave to CSS (.op-head opacity:0 hides it, no flash);
    // disabled -> show the plain fallback; enabled -> hidden until the entrance.
    let opacity: number | undefined;
    if (enabled === null) opacity = undefined;
    else if (!enabled) opacity = 1;
    else opacity = revealed ? 1 : 0;

    return {
      position: "relative",
      display: "block",
      // Let a horizontal finger-drag warp the text while vertical swipes still
      // scroll the page.
      touchAction: "pan-y",
      // No container fade — the word-by-word bloom (in the canvas) is the reveal.
      ...style,
      ...(opacity !== undefined ? { opacity } : null),
      ...(glHidden ? { color: "transparent" } : null),
    };
  }, [style, glHidden, enabled, revealed]);

  return createElement(
    as,
    { ref: rootRef, className, style: rootStyle },
    text,
    active
      ? createElement(
          "div",
          {
            key: "lt-gl",
            "aria-hidden": true,
            style: { position: "absolute", inset: `-${PAD_EM}em`, pointerEvents: "none" } as CSSProperties,
          },
          createElement(LiquidTextGL, { getEl, controls, onActive, onRevealDone: onRevealComplete })
        )
      : null
  );
});

export default LiquidText;
