"use client";
/**
 * <LiquidHover> — wraps arbitrary HTML (icon + heading + text …) and makes it
 * RIPPLE like liquid on hover, matching the media MotionHover feel — but for
 * DOM content, not an image.
 *
 *   <LiquidHover className="…"> …card content… </LiquidHover>
 *
 * How it works (reliable in every browser, incl. Safari desktop + iOS):
 *   1. The children render as normal, interactive DOM (what you click/read/SEO).
 *   2. On hover we SNAPSHOT the content to a canvas with html-to-image (which
 *      inlines the web fonts, so Cormorant/Inter render correctly), upload it as
 *      a WebGL texture, then paint a simplex-noise DISPLACEMENT of that snapshot
 *      over the card while hiding the live content.
 *   3. On mouse-out the ripple eases back to calm, then the live DOM is restored.
 *
 * We deliberately do NOT use an SVG feDisplacementMap CSS filter — it does not
 * render reliably on Safari. The snapshot→WebGL path works everywhere WebGL does.
 *
 * Graceful fallback: on touch / coarse pointers, prefers-reduced-motion, no
 * WebGL, or if the snapshot fails, the plain card is shown untouched (a subtle
 * CSS hover can still apply). The text/links always work — the live DOM is only
 * visually swapped for the canvas while actively rippling.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ─────────────── Tunable feel (edit these) ─────────────── */
const STRENGTH = 0.01; // displacement amplitude (higher = wobblier)
const SPEED = 0.45; // ambient flow speed
const NOISE_SCALE = 3.2; // noise frequency (low = big swells, high = tight ripples)
const MOUSE_RADIUS = 0.42; // how far around the cursor the ripple concentrates (uv)
const MOUSE_PULL = 0.22; // how strongly the flow leans toward the cursor
const BASE = 0.32; // how much the WHOLE card warps vs. only under the cursor (0..1)
const MOTION_GAIN = 85; // pointer SPEED → ripple (higher = triggers with less movement)
const MOTION_DECAY = 0.26; // seconds to settle back to calm while the pointer holds still
const MAX_STRENGTH = 1.0; // ceiling for the built-up ripple
/* ───────────────────────────────────────────────────────── */

interface LiquidHoverProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Class for the element that is SNAPSHOT + distorted. Put the box visuals
   *  (background, border, padding, radius) here so the WHOLE box ripples as one,
   *  not just the text. */
  contentClassName?: string;
  /** Override amplitude for this instance (falls back to STRENGTH). */
  strength?: number;
  /** Baseline ripple (0..1) kept while hovering, even without moving — so it
   *  wobbles continuously on hover (like the hero) instead of only on movement.
   *  0 (default) = purely motion-driven (settles to calm when the pointer holds still). */
  ambient?: number;
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!window.WebGLRenderingContext && !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform float uTime, uStrength, uAmp, uNoiseScale, uRadius, uBase, uPull;
uniform vec2 uMouse;
varying vec2 vUv;

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,-0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main(){
  // flip Y: the snapshot canvas is top-down, WebGL uv is bottom-up
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  vec2 q = uv * uNoiseScale;
  vec2 flow = vec2(snoise(q + vec2(uTime, 0.0)), snoise(q + vec2(0.0, uTime)));
  flow += 0.35 * vec2(snoise(q * 2.1 + vec2(uTime * 1.3, 10.0)), snoise(q * 2.1 + vec2(10.0, uTime * 1.1)));

  float prox = 1.0 - smoothstep(0.0, uRadius, distance(uv, uMouse));
  float amp = uAmp * uStrength * mix(uBase, 1.0, prox);

  vec2 disp = flow * amp;
  disp += normalize(uMouse - uv + 1e-5) * prox * uPull * uStrength * uAmp;

  vec2 s = uv + disp;
  // outside the snapshot => transparent, with a soft edge
  if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  gl_FragColor = texture2D(uTex, s);
}
`;

export default function LiquidHover({ children, className, style, contentClassName, strength: strengthProp, ambient = 0 }: LiquidHoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capable, setCapable] = useState(false);
  const [rippling, setRippling] = useState(false); // canvas shown, live content hidden

  // WebGL + animation state (mutable, no re-renders).
  const gl = useRef<WebGLRenderingContext | null>(null);
  const prog = useRef<WebGLProgram | null>(null);
  const tex = useRef<WebGLTexture | null>(null);
  const uni = useRef<Record<string, WebGLUniformLocation | null>>({});
  const snapSize = useRef<{ w: number; h: number } | null>(null);
  const raf = useRef<number | undefined>(undefined);
  const startT = useRef(0);
  const hovering = useRef(false); // pointer is over the box
  const strength = useRef(0); // motion-built ripple, decays when the pointer holds still
  const lastPointer = useRef<{ t: number; x: number; y: number } | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const mouseT = useRef({ x: 0.5, y: 0.5 });
  const busy = useRef(false); // a snapshot is in flight
  const amp = strengthProp ?? STRENGTH;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setCapable(!reduce && !coarse && supportsWebGL());
  }, []);

  // Lazily build the WebGL program on the overlay canvas (once).
  const initGL = useCallback(() => {
    if (gl.current) return true;
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true })) as WebGLRenderingContext | null;
    if (!ctx) return false;

    const compile = (type: number, src: string) => {
      const sh = ctx.createShader(type)!;
      ctx.shaderSource(sh, src);
      ctx.compileShader(sh);
      return sh;
    };
    const p = ctx.createProgram()!;
    ctx.attachShader(p, compile(ctx.VERTEX_SHADER, VERT));
    ctx.attachShader(p, compile(ctx.FRAGMENT_SHADER, FRAG));
    ctx.linkProgram(p);
    if (!ctx.getProgramParameter(p, ctx.LINK_STATUS)) return false;
    ctx.useProgram(p);

    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(p, "aPos");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);

    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA); // premultiplied alpha

    const t = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, t);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);

    for (const n of ["uTex", "uTime", "uStrength", "uAmp", "uNoiseScale", "uRadius", "uBase", "uPull", "uMouse"]) {
      uni.current[n] = ctx.getUniformLocation(p, n);
    }
    ctx.uniform1i(uni.current.uTex!, 0);
    ctx.uniform1f(uni.current.uAmp!, amp);
    ctx.uniform1f(uni.current.uNoiseScale!, NOISE_SCALE);
    ctx.uniform1f(uni.current.uRadius!, MOUSE_RADIUS);
    ctx.uniform1f(uni.current.uBase!, BASE);
    ctx.uniform1f(uni.current.uPull!, MOUSE_PULL);

    gl.current = ctx;
    prog.current = p;
    tex.current = t;
    return true;
  }, [amp]);

  // Snapshot the live content into the texture (cached until the box resizes).
  const ensureSnapshot = useCallback(async (): Promise<boolean> => {
    const el = contentRef.current;
    const ctx = gl.current;
    if (!el || !ctx) return false;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) return false;
    if (snapSize.current && snapSize.current.w === w && snapSize.current.h === h) return true; // cached

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { toCanvas } = await import("html-to-image");
    const snapshot = await toCanvas(el, { pixelRatio: dpr, backgroundColor: undefined, cacheBust: true });

    const canvas = canvasRef.current;
    if (!canvas) return false;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.viewport(0, 0, canvas.width, canvas.height);
    ctx.bindTexture(ctx.TEXTURE_2D, tex.current);
    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, snapshot);
    snapSize.current = { w, h };
    return true;
  }, []);

  const stopLoop = useCallback(() => {
    if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    raf.current = undefined;
  }, []);

  const frame = useCallback((now: number) => {
    const ctx = gl.current;
    if (!ctx) return;
    if (!startT.current) startT.current = now;
    const t = (now - startT.current) / 1000;
    const dt = 1 / 60;

    // Motion-driven: the ripple DECAYS every frame, so holding the pointer still
    // settles it back to calm. Movement (onMove) is what builds it back up.
    strength.current *= Math.exp(-dt / MOTION_DECAY);
    if (strength.current < 0.001) strength.current = 0;
    // While hovering, keep a baseline ripple so it wobbles continuously (ambient=0
    // stays purely motion-driven and settles to calm).
    if (hovering.current && ambient > 0 && strength.current < ambient) strength.current = ambient;
    mouse.current.x += (mouseT.current.x - mouse.current.x) * 0.2;
    mouse.current.y += (mouseT.current.y - mouse.current.y) * 0.2;

    ctx.uniform1f(uni.current.uTime!, t * SPEED);
    ctx.uniform1f(uni.current.uStrength!, strength.current);
    ctx.uniform2f(uni.current.uMouse!, mouse.current.x, mouse.current.y);
    ctx.clearColor(0, 0, 0, 0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);

    if (strength.current === 0) {
      // Settled. If the pointer already left, restore the live DOM; if it's still
      // hovering (just holding still), pause the loop — onMove will resume it.
      stopLoop();
      if (!hovering.current) setRippling(false);
      return;
    }
    raf.current = requestAnimationFrame(frame);
  }, [stopLoop, ambient]);

  const startLoop = useCallback(() => {
    if (raf.current === undefined) raf.current = requestAnimationFrame(frame);
  }, [frame]);

  const onEnter = useCallback(async () => {
    if (!capable || busy.current) return;
    hovering.current = true;
    busy.current = true;
    const ok = initGL() && (await ensureSnapshot());
    busy.current = false;
    if (!ok || !hovering.current) return;
    setRippling(true); // show the canvas…
    startLoop(); // …and draw one calm frame now (movement will ripple it)
  }, [capable, initGL, ensureSnapshot, startLoop]);

  const onMove = useCallback((e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    // Build strength from pointer SPEED (uv/ms). Holding still adds nothing.
    const now = e.timeStamp || performance.now();
    const prev = lastPointer.current;
    if (prev) {
      const d = Math.max(1, now - prev.t);
      const dist = Math.hypot(x - prev.x, y - prev.y);
      strength.current = Math.min(MAX_STRENGTH, strength.current + (dist / d) * MOTION_GAIN);
    }
    lastPointer.current = { t: now, x, y };
    mouseT.current = { x, y };
    if (rippling) startLoop(); // resume the loop if it paused while idle
  }, [rippling, startLoop]);

  const onLeave = useCallback(() => {
    hovering.current = false;
    lastPointer.current = null;
    startLoop(); // ensure the loop runs to decay + then restore the DOM
  }, [startLoop]);

  // Re-snapshot on resize so the ripple matches a reflowed card.
  useEffect(() => {
    if (!capable) return;
    const onResize = () => { snapSize.current = null; };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [capable]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", ...style }}
      onPointerEnter={capable ? onEnter : undefined}
      onPointerMove={capable ? onMove : undefined}
      onPointerLeave={capable ? onLeave : undefined}
    >
      <div ref={contentRef} className={contentClassName} style={{ opacity: rippling ? 0 : 1 }}>
        {children}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: rippling ? 1 : 0,
        }}
      />
    </div>
  );
}
