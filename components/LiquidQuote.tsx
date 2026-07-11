"use client";
/**
 * <LiquidQuote> — a self-contained liquid-ripple text renderer for the pull-quote.
 *
 * Unlike <LiquidText> (which drives a WebGL shader and depends on DOM reveal
 * timing), this uses a plain Canvas2D two-pass slice warp: the text is drawn once
 * to an offscreen buffer, then every frame each vertical column is nudged up/down
 * and each horizontal row is nudged left/right by a travelling sine wave whose
 * amplitude swells near the cursor. No WebGL, no context loss, no measuring race
 * against a reflow — so it ripples reliably everywhere it renders.
 *
 * At rest the crisp DOM text shows. On hover the canvas fades in (and the DOM
 * text goes transparent) so only the rippling copy is visible; on leave it settles
 * and fades back out. Reduced-motion / coarse-pointer / no-canvas -> plain text.
 */
import { useEffect, useRef } from "react";

export default function LiquidQuote({ text, className }: { text: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !textRef.current || !canvasRef.current) return;
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;

    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return; // no Canvas2D -> DOM text stays crisp
    const ctx = ctx0; // non-null alias so nested closures keep the narrowed type

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduce || coarse) return; // phones / reduced-motion just get the DOM text

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d")!;

    let W = 0, H = 0, PAD = 0;
    let raf = 0;
    let running = false;
    // Hero-style, MOTION-driven warp: moving the cursor liquifies the text, holding
    // still or leaving eases it back to crisp. `strength` is the live warp amount.
    let strength = 0;
    let mx = 0, my = 0;      // pointer, in canvas backing pixels
    let havePointer = false;
    let contentW = 400;      // text width (css px), scales the amplitude
    let last = 0;            // previous frame timestamp (ms)
    let clock = 0;           // accumulated seconds for the flow field

    // Build the offscreen text buffer from the DOM element's own computed style,
    // so the canvas copy matches font / size / colour / centring exactly.
    function render() {
      const cs = getComputedStyle(textEl);
      const fontSize = parseFloat(cs.fontSize) || 28;
      const lineH = parseFloat(cs.lineHeight) || fontSize * 1.32;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const color = cs.color;
      const maxW = textEl.clientWidth || 400;
      contentW = maxW;

      // Read the EXACT line breaks the browser produced, by walking the text node
      // character by character and splitting wherever the client-rect top jumps to
      // a new line. This guarantees the canvas copy has the same lines / count as
      // the DOM (self-wrapping with measureText could disagree and overlap).
      octx.font = font;
      let lines: string[] = [];
      const node = textEl.firstChild;
      if (node && node.nodeType === 3 && node.textContent) {
        const s = node.textContent;
        const range = document.createRange();
        let start = 0;
        let prevTop: number | null = null;
        for (let i = 0; i < s.length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const r = range.getClientRects()[0];
          if (!r) continue;
          if (prevTop === null) prevTop = r.top;
          else if (r.top - prevTop > 1) {
            lines.push(s.slice(start, i));
            start = i;
            prevTop = r.top;
          }
        }
        lines.push(s.slice(start));
        lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
      }
      if (!lines.length) lines = [text];

      PAD = Math.ceil(fontSize * 0.7); // room for the ripple displacement
      const contentH = Math.max(lineH, lines.length * lineH);
      W = maxW + PAD * 2;
      H = Math.ceil(contentH + PAD * 2);

      // Position the canvas so its content area sits exactly over the DOM text.
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.style.left = -PAD + "px";
      canvas.style.top = -PAD + "px";
      for (const c of [canvas, off, buf]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }

      // Draw the text into the offscreen buffer, centred, at device resolution.
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, W, H);
      octx.font = font;
      octx.fillStyle = color;
      octx.textAlign = "center";
      octx.textBaseline = "alphabetic";
      // Baseline of line i = line-box top + half-leading + font ascent, so the
      // canvas copy lands on the DOM's own baselines (no vertical jump on hover).
      const ascent = (lineH - fontSize) / 2 + fontSize * 0.76;
      for (let i = 0; i < lines.length; i++) {
        octx.fillText(lines[i], W / 2, PAD + i * lineH + ascent);
      }
    }

    // Feel matched to the hero headline (LiquidTextGL TUNING): a two-octave flow
    // field, a lean toward the cursor, and — the signature — warp driven by pointer
    // MOTION that decays to crisp ~350ms after the cursor stops.
    const step = Math.max(2, Math.round(2 * dpr));
    const MOTION_DECAY = 0.13; // s
    const AMP_FRAC = 0.03;     // max warp as a fraction of text width
    const MOUSE_BASE = 0.35;   // warp everywhere vs. only near the cursor
    const FLOW_SPEED = 0.5;
    const TAU = 6.2831853;

    function frame(now: number) {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      clock += dt;
      strength *= Math.exp(-dt / MOTION_DECAY);
      if (strength < 0.0004) strength = 0;

      const ampPx = AMP_FRAC * contentW * dpr * strength;
      const flowT = clock * FLOW_SPEED * TAU;
      const kx = (2.4 * TAU) / Math.max(1, off.width); // ~2.4 flow cells across the width
      const sig = 0.42 * Math.max(off.width, off.height);
      const twoSig2 = 2 * sig * sig;

      // Pass 1: offscreen -> buf, vertical displacement per column.
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.clearRect(0, 0, buf.width, buf.height);
      for (let x = 0; x < off.width; x += step) {
        const gx = Math.exp(-((x - mx) * (x - mx)) / twoSig2);
        const local = MOUSE_BASE + (1 - MOUSE_BASE) * gx;
        const flow = Math.sin(x * kx + flowT) + 0.5 * Math.sin(x * kx * 2.1 + flowT * 1.3 + 10);
        const lean = gx * (my - off.height * 0.5) * 0.05; // pull toward the cursor
        const dy = ampPx * local * flow * 0.5 + strength * lean;
        bctx.drawImage(off, x, 0, step, off.height, x, dy, step, off.height);
      }

      // Pass 2: buf -> visible canvas, horizontal displacement per row.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < buf.height; y += step) {
        const gy = Math.exp(-((y - my) * (y - my)) / twoSig2);
        const local = MOUSE_BASE + (1 - MOUSE_BASE) * gy;
        const flow = Math.sin(y * kx + flowT + 3.1) + 0.5 * Math.sin(y * kx * 2.1 + flowT * 1.1 + 20);
        const lean = gy * (mx - off.width * 0.5) * 0.05; // pull toward the cursor
        const dx = ampPx * local * flow * 0.5 + strength * lean;
        ctx.drawImage(buf, 0, y, buf.width, step, dx, y, buf.width, step);
      }

      // Crossfade: crisp DOM text when calm, rippling canvas while it warps.
      const vis = Math.min(1, strength * 2.4);
      canvas.style.opacity = String(vis);
      textEl.style.color = vis > 0.1 ? "transparent" : "";

      if (strength > 0.0004) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        canvas.style.opacity = "0";
        textEl.style.color = "";
      }
    }

    function start() {
      if (!running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) * dpr;
      const ny = (e.clientY - r.top) * dpr;
      if (havePointer) {
        const d = Math.hypot(nx - mx, ny - my);
        // pointer speed -> warp (normalised by width so it feels the same at any size)
        strength = Math.min(1, strength + (d / Math.max(1, off.width)) * 3.2);
      }
      mx = nx;
      my = ny;
      havePointer = true;
      start();
    };
    const onEnter = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (e.clientY - r.top) * dpr;
      havePointer = true;
    };
    // leaving needs no handler: with no new motion, `strength` decays back to crisp.

    render();
    // Re-render once the display font has actually loaded (serif italic, not the
    // fallback), and whenever the box resizes.
    if ("fonts" in document) {
      (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready
        .then(render)
        .catch(() => {});
    }
    const ro = new ResizeObserver(() => {
      render();
      if (!running) canvas.style.opacity = "0";
    });
    ro.observe(wrap);

    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerenter", onEnter, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onEnter);
      textEl.style.color = "";
    };
  }, [text]);

  return (
    <div ref={wrapRef} className={`lq-quote ${className || ""}`}>
      <div ref={textRef} className="quote-text lq-text">{text}</div>
      <canvas ref={canvasRef} className="lq-canvas" aria-hidden="true" />
    </div>
  );
}
