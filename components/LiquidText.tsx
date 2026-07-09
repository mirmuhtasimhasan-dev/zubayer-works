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
  /** Show the full text from the start (no word-by-word reveal) and only ripple
   *  on hover — reliable for small standalone text like links/CTAs. */
  instant?: boolean;
  /** CSS selector of an ancestor whose hover should drive the ripple (instead of
   *  just the text itself) — e.g. ".service-card" so the whole card triggers it. */
  hoverTarget?: string;
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
  { text, as = "span", className, style, hover = true, entranceDelay = 0, onRevealComplete, instant = false, hoverTarget },
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
  const [hovering, setHovering] = useState(false); // instant mode: canvas only shows on hover
  const leaveTimer = useRef<number | undefined>(undefined);
  const [revealDone, setRevealDone] = useState(false); // entrance finished

  const active = !!enabled && inView;
  // After the entrance finishes (or in `instant` mode), the plain DOM text is
  // the reliable base — always shown at rest, canvas only overlays on hover — so
  // re-entering the viewport can never leave the heading blank.
  const inst = instant || revealDone;

  useImperativeHandle(ref, () => ({ node: rootRef.current }), []);

  const handleRevealDone = useCallback(() => {
    setRevealDone(true);
    onRevealComplete?.();
  }, [onRevealComplete]);

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
  // (Skipped in `instant` mode — the GL paints the full text from the start.)
  useEffect(() => {
    if (!active || inst) return;
    const id = window.setTimeout(() => {
      setRevealed(true);
      controls.current.reveal?.();
    }, entranceDelay * 1000);
    return () => window.clearTimeout(id);
  }, [active, entranceDelay, inst]);

  // Fallback (no WebGL / reduced-motion): the plain text is always shown, so
  // mark the reveal done shortly after the delay to keep sequencing working.
  useEffect(() => {
    if (enabled !== false) return;
    const id = window.setTimeout(handleRevealDone, (entranceDelay + 0.4) * 1000);
    return () => window.clearTimeout(id);
  }, [enabled, entranceDelay, handleRevealDone]);

  // Motion-reactive warp for BOTH mouse and touch: pointer events cover mouse,
  // pen and finger, so a finger drag over the heading warps it on mobile just
  // like moving the cursor does on desktop.
  useEffect(() => {
    if (!active || !hover) return;
    const el = rootRef.current;
    if (!el) return;
    // Listen on an ancestor (e.g. the whole card) when asked, so hovering
    // anywhere over it ripples the text — otherwise listen on the text itself.
    const listenEl: HTMLElement = (hoverTarget && (el.closest(hoverTarget) as HTMLElement)) || el;
    const toUv = (e: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    const onMove = (e: PointerEvent) => {
      window.clearTimeout(leaveTimer.current);
      setHovering(true);
      controls.current.setPointer?.(toUv(e));
    };
    const onEnd = () => {
      controls.current.clearPointer?.();
      // keep the canvas up a moment so the ripple can settle before swapping back
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setHovering(false), 450);
    };
    listenEl.addEventListener("pointermove", onMove, { passive: true });
    listenEl.addEventListener("pointerdown", onMove, { passive: true });
    listenEl.addEventListener("pointerleave", onEnd);
    listenEl.addEventListener("pointerup", onEnd);
    listenEl.addEventListener("pointercancel", onEnd);
    return () => {
      window.clearTimeout(leaveTimer.current);
      listenEl.removeEventListener("pointermove", onMove);
      listenEl.removeEventListener("pointerdown", onMove);
      listenEl.removeEventListener("pointerleave", onEnd);
      listenEl.removeEventListener("pointerup", onEnd);
      listenEl.removeEventListener("pointercancel", onEnd);
    };
  }, [active, hover, hoverTarget]);

  const getEl = useCallback(() => rootRef.current, []);
  const onActive = useCallback(() => setGlHidden(true), []);

  const rootStyle = useMemo<CSSProperties>(() => {
    // undecided -> leave to CSS (.op-head opacity:0 hides it, no flash);
    // disabled -> show the plain fallback; enabled -> hidden until the entrance.
    let opacity: number | undefined;
    if (inst) opacity = 1; // always visible; canvas overlays only on hover
    else if (enabled === null) opacity = undefined;
    else if (!enabled) opacity = 1;
    else opacity = revealed ? 1 : 0;

    // Once `inst`, the plain DOM text is always shown at rest; it's only hidden
    // (canvas takes over) while hovering — so the text can never vanish.
    const domHidden = inst ? hovering : glHidden;

    return {
      position: "relative",
      display: "block",
      // Let a horizontal finger-drag warp the text while vertical swipes still
      // scroll the page.
      touchAction: "pan-y",
      ...style,
      ...(opacity !== undefined ? { opacity } : null),
      ...(domHidden ? { color: "transparent" } : null),
    };
  }, [style, glHidden, enabled, revealed, inst, hovering]);

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
            style: {
              position: "absolute",
              inset: `-${PAD_EM}em`,
              pointerEvents: "none",
              // once inst: canvas visible only on hover; otherwise DOM text shows.
              opacity: inst ? (hovering ? 1 : 0) : 1,
              transition: "opacity .18s ease",
            } as CSSProperties,
          },
          createElement(LiquidTextGL, { getEl, controls, onActive, onRevealDone: handleRevealDone, instant: inst })
        )
      : null
  );
});

export default LiquidText;
