"use client";
/**
 * LiquidTextGL — the WebGL half of <LiquidText>.
 *
 * The headline is drawn word-by-word into an offscreen 2D canvas using the
 * element's *computed* font/colour/line-height (the exact next/font Cormorant
 * Garamond, so it's identical to the plain .op-head heading). A full-cover quad
 * samples that texture through a simplex-noise flow field so the letters can
 * warp like liquid.
 *
 *   • ENTRANCE — the words bloom in one at a time (each fades up), slowly.
 *   • WARP — driven by pointer MOTION: moving the cursor over the text warps it
 *     (strongest under the cursor, leaning toward it); holding still or leaving
 *     eases it back to crisp within ~350ms. Stillness = crisp, movement = liquid.
 *
 * Loaded only via next/dynamic({ ssr: false }) so `three` never touches the
 * server/initial bundle; the parent unmounts it when the hero scrolls away.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────────────
 *  TWEAKABLE FEEL — edit these and save; HMR applies them live.
 * ──────────────────────────────────────────────────────────────────────── */
export const TUNING = {
  /* ── Liquid warp (mouse-motion driven) ── */
  /** Overall warp distance, as a fraction of the text width. THE liquid knob. */
  AMPLITUDE: 0.02,
  /** Spatial frequency of the flow field (low = swells, high = ripples). */
  NOISE_SCALE: 2.4,
  /** Speed the flow field animates while warping. */
  FLOW_SPEED: 0.5,
  /** Pointer speed (uv/ms) → warp strength. Higher = warps with less movement. */
  MOTION_GAIN: 95,
  /** Cap on warp strength from fast flicks. */
  MAX_STRENGTH: 1.2,
  /** Seconds for the warp to settle to crisp after the pointer stops (~0.3–0.4s). */
  MOTION_DECAY: 0.13,
  /** How far around the cursor the warp reaches (uv). */
  MOUSE_RADIUS: 0.5,
  /** How much warp the rest of the line gets vs. right under the cursor (0..1). */
  MOUSE_BASE: 0.35,
  /** How much the flow leans toward the cursor near it. */
  MOUSE_PULL: 0.5,
  /** Seconds for the cursor hot spot to trail the real pointer. */
  MOUSE_TRAIL: 0.1,
  /** Subtle glassy chromatic separation, scaled by warp (uv units). */
  CHROMATIC: 0.0035,

  /* ── Word-by-word entrance ── */
  /** Delay between each word starting to appear (ms). Bigger = slower reveal. */
  WORD_STEP: 230,
  /** How long each word takes to fade in (ms). */
  WORD_FADE: 520,
};

// Overhang around the text box (in em) so warped glyphs near the edges aren't
// clipped. Must match the inset used by the overlay <div> in LiquidText.tsx.
export const PAD_EM = 0.55;

export interface LiquidControls {
  /** Pointer is at uv `p` (origin bottom-left) — velocity drives the warp. */
  setPointer?: (p: [number, number]) => void;
  /** Pointer left — let the warp decay to crisp. */
  clearPointer?: () => void;
  /** Start the word-by-word entrance. */
  reveal?: (stepMs?: number, fadeMs?: number) => void;
}

/** Live health of the GL overlay. The parent polls this and will ONLY hide the
 *  real DOM headline while the canvas is provably painting real content — so a
 *  stalled loop, a lost context or an empty texture can never blank the hero. */
export interface LiquidStatus {
  /** performance.now() of the last rendered frame (0 = never painted). */
  lastFrame: number;
  /** The texture actually contains painted words. */
  hasContent: boolean;
  /** The WebGL context is currently lost. */
  contextLost: boolean;
}

interface GLProps {
  getEl: () => HTMLElement | null;
  controls: React.MutableRefObject<LiquidControls>;
  /** Written to by the GL every frame; read by the parent's watchdog. */
  status: React.MutableRefObject<LiquidStatus>;
  onActive?: () => void;
  /** Fired once every word has finished blooming in. */
  onRevealDone?: () => void;
  /** Skip the word-by-word entrance — paint the full text at once (reliable),
   *  and just ripple on hover. */
  instant?: boolean;
}

interface Word {
  text: string;
  x: number;
  baseline: number;
  width: number;
}

type RevealPhase = "blank" | "revealing" | "done";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTex;
  uniform float uTime;      // flow time
  uniform float uStrength;  // motion-driven warp (0 at rest -> crisp)
  uniform vec2  uMouse;     // smoothed cursor, uv space
  uniform float uAmplitude;
  uniform float uNoiseScale;
  uniform float uRadius;
  uniform float uBase;
  uniform float uPull;
  uniform float uChromatic;
  varying vec2 vUv;

  // ── Simplex noise (Ashima / Stefan Gustavson, 2D) ──────────────────────
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    vec2 q = uv * uNoiseScale;
    vec2 flow = vec2(
      snoise(q + vec2(uTime, 0.0)),
      snoise(q + vec2(0.0, uTime))
    );
    flow += 0.35 * vec2(
      snoise(q * 2.1 + vec2(uTime * 1.3, 10.0)),
      snoise(q * 2.1 + vec2(10.0, uTime * 1.1))
    );

    float prox = 1.0 - smoothstep(0.0, uRadius, distance(uv, uMouse));
    float amp = uStrength * mix(uBase, 1.0, prox);

    vec2 disp = flow * uAmplitude * amp;
    disp += normalize(uMouse - uv + 1e-5) * prox * uStrength * uPull * uAmplitude;

    vec2 uvD = uv + disp;
    vec4 col = texture2D(uTex, uvD);
    float ca = uChromatic * amp;
    col.r = texture2D(uTex, uvD + vec2(ca, 0.0)).r;
    col.b = texture2D(uTex, uvD - vec2(ca, 0.0)).b;
    gl_FragColor = col;
  }
`;

function cssAlign(value: string): "left" | "center" | "right" {
  if (value === "center") return "center";
  if (value === "right" || value === "end") return "right";
  return "left";
}

function Scene({ getEl, controls, status, onActive, onRevealDone, instant }: GLProps) {
  const dpr = useThree((s) => s.viewport.dpr);
  const renderer = useThree((s) => s.gl);

  const offscreen = useRef<HTMLCanvasElement | null>(null);
  const texture = useRef<THREE.CanvasTexture | null>(null);
  const painted = useRef(false);
  const revealDoneFired = useRef(false);

  const words = useRef<Word[]>([]);
  const meta = useRef({ cssW: 1, cssH: 1, ratio: 1, font: "", color: "#000", letterSpacing: "normal" });
  const phase = useRef<RevealPhase>(instant ? "done" : "blank");
  const revealStart = useRef(0);
  const stepMsRef = useRef(TUNING.WORD_STEP);
  const fadeMsRef = useRef(TUNING.WORD_FADE);

  // Motion-driven warp state.
  const strength = useRef(0);
  const mouse = useRef(new THREE.Vector2(0.5, 0.55));
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.55));
  const lastPointer = useRef<{ t: number; x: number; y: number } | null>(null);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uAmplitude: { value: TUNING.AMPLITUDE },
      uNoiseScale: { value: TUNING.NOISE_SCALE },
      uRadius: { value: TUNING.MOUSE_RADIUS },
      uBase: { value: TUNING.MOUSE_BASE },
      uPull: { value: TUNING.MOUSE_PULL },
      uChromatic: { value: TUNING.CHROMATIC },
    }),
    []
  );

  // Measure the headline: wrap into lines like the DOM, then record each word's
  // box (alignment-aware x) so we can paint any subset with per-word opacity.
  const measure = useCallback(() => {
    const el = getEl();
    if (!el) return;
    if (!offscreen.current) offscreen.current = document.createElement("canvas");
    const canvas = offscreen.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const contentWidth = el.clientWidth;

    // 0x0 / mid-layout guard: measuring here would wrap every word onto its own
    // line into a pad-sized canvas -> an EMPTY texture. Report "no content" so the
    // parent keeps showing the real DOM headline, and try again on the next
    // resize / rAF rebuild.
    if (contentWidth < 1 || rect.width < 1 || rect.height < 1) {
      words.current = [];
      status.current.hasContent = false;
      return;
    }

    const fontSize = parseFloat(cs.fontSize) || 16;
    const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
    const pad = PAD_EM * fontSize;
    const ratio = Math.min(dpr || window.devicePixelRatio || 1, 2);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const letterSpacing = cs.letterSpacing && cs.letterSpacing !== "normal" ? cs.letterSpacing : "normal";
    const align = cssAlign(cs.textAlign);

    const cssW = rect.width + pad * 2;
    const cssH = rect.height + pad * 2;
    canvas.width = Math.max(1, Math.ceil(cssW * ratio));
    canvas.height = Math.max(1, Math.ceil(cssH * ratio));

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.font = font;
    try {
      if (letterSpacing !== "normal") (ctx as CanvasTextDrawingStyles).letterSpacing = letterSpacing;
    } catch {
      /* unsupported */
    }
    const m = ctx.measureText("Hg");
    const asc = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || fontSize * 0.8;
    const desc = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || fontSize * 0.2;
    const halfLeading = (lineHeight - (asc + desc)) / 2;
    const spaceW = ctx.measureText(" ").width;

    // Take the browser's ACTUAL line breaks (and each line's real left edge) by
    // walking the text node with a Range. Re-wrapping here with measureText can
    // disagree with the DOM (different line count) — the canvas would then paint
    // more lines than its height allows and clip the last one.
    const lines: { tokens: string[]; left: number | null }[] = [];
    const textNode = Array.from(el.childNodes).find(
      (n) => n.nodeType === 3 && (n.textContent || "").trim().length > 0
    ) as Text | undefined;

    if (textNode) {
      const s = textNode.textContent || "";
      const probe = document.createRange();
      const pushLine = (from: number, to: number) => {
        let a = from;
        let b = to;
        while (a < b && /\s/.test(s[a])) a++;
        while (b > a && /\s/.test(s[b - 1])) b--;
        if (b <= a) return;
        const tokens = s.slice(a, b).split(/\s+/).filter(Boolean);
        if (!tokens.length) return;
        probe.setStart(textNode, a);
        probe.setEnd(textNode, b);
        const lr = probe.getBoundingClientRect();
        lines.push({ tokens, left: lr.width ? lr.left - rect.left : null });
      };

      const walk = document.createRange();
      let start = 0;
      let prevTop: number | null = null;
      for (let i = 0; i < s.length; i++) {
        walk.setStart(textNode, i);
        walk.setEnd(textNode, i + 1);
        const r = walk.getClientRects()[0];
        if (!r) continue;
        if (prevTop === null) prevTop = r.top;
        else if (r.top - prevTop > 1) {
          pushLine(start, i);
          start = i;
          prevTop = r.top;
        }
      }
      pushLine(start, s.length);
    }

    // Fallback (no text node): wrap it ourselves, aligned by CSS text-align.
    if (!lines.length) {
      for (const paragraph of el.textContent?.split("\n") ?? []) {
        const tokens = paragraph.split(/\s+/).filter(Boolean);
        let line: string[] = [];
        for (const w of tokens) {
          const test = line.concat(w);
          if (line.length && ctx.measureText(test.join(" ")).width > contentWidth) {
            lines.push({ tokens: line, left: null });
            line = [w];
          } else {
            line = test;
          }
        }
        if (line.length) lines.push({ tokens: line, left: null });
      }
    }

    const list: Word[] = [];
    let y = pad + halfLeading + asc;
    for (const line of lines) {
      // Prefer the line's measured left edge from the DOM; otherwise derive it
      // from the CSS alignment.
      let startX: number;
      if (line.left !== null) {
        startX = pad + line.left;
      } else {
        const lineWidth = ctx.measureText(line.tokens.join(" ")).width;
        startX =
          align === "center"
            ? pad + (contentWidth - lineWidth) / 2
            : align === "right"
            ? pad + (contentWidth - lineWidth)
            : pad;
      }
      let x = startX;
      for (const w of line.tokens) {
        const width = ctx.measureText(w).width;
        list.push({ text: w, x, baseline: y, width });
        x += width + spaceW;
      }
      y += lineHeight;
    }
    words.current = list;
    meta.current = { cssW, cssH, ratio, font, color: cs.color, letterSpacing };
    status.current.hasContent = list.length > 0;
  }, [getEl, dpr, status]);

  // Paint the words at the given time (per-word opacity from the reveal phase).
  const renderTexture = useCallback(
    (now: number) => {
      const canvas = offscreen.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { cssW, cssH, ratio, font, color, letterSpacing } = meta.current;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      try {
        if (letterSpacing !== "normal") (ctx as CanvasTextDrawingStyles).letterSpacing = letterSpacing;
      } catch {
        /* unsupported */
      }

      const list = words.current;
      for (let i = 0; i < list.length; i++) {
        let a = 1;
        if (phase.current === "blank") a = 0;
        else if (phase.current === "revealing") {
          a = Math.max(0, Math.min(1, (now - (revealStart.current + i * stepMsRef.current)) / fadeMsRef.current));
        }
        if (a <= 0.001) continue;
        ctx.globalAlpha = a;
        ctx.fillText(list[i].text, list[i].x, list[i].baseline);
      }
      ctx.globalAlpha = 1;

      if (!texture.current) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        texture.current = tex;
        uniforms.uTex.value = tex;
      } else {
        texture.current.needsUpdate = true;
      }
    },
    [uniforms]
  );

  const rebuild = useCallback(() => {
    measure();
    renderTexture(performance.now());
  }, [measure, renderTexture]);

  useEffect(() => {
    rebuild();
    let cancelled = false;
    // Re-measure once layout has settled — on re-entering the viewport the first
    // synchronous measure can still see a 0-width / stale box.
    const raf = requestAnimationFrame(() => {
      if (!cancelled) rebuild();
    });
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(() => {
      if (!cancelled) rebuild();
    });
    const el = getEl();
    let ro: ResizeObserver | null = null;
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => rebuild());
      ro.observe(el);
    }
    const onResize = () => rebuild();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [rebuild, getEl]);

  // Context loss: keep the canvas alive (preventDefault) but tell the parent, which
  // instantly falls back to the real DOM headline. On restore, the GPU texture is
  // gone — drop it and rebuild from scratch.
  useEffect(() => {
    const canvas = renderer.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      status.current.contextLost = true;
      status.current.hasContent = false;
    };
    const onRestored = () => {
      status.current.contextLost = false;
      texture.current?.dispose();
      texture.current = null;
      uniforms.uTex.value = null;
      rebuild();
    };
    canvas.addEventListener("webglcontextlost", onLost as EventListener);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [renderer, rebuild, status, uniforms]);

  // Strict-Mode safe: drop the texture on unmount so a re-mount rebuilds a fresh
  // one (rebuild() only creates a texture when texture.current is null).
  useEffect(
    () => () => {
      texture.current?.dispose();
      texture.current = null;
      status.current.hasContent = false;
      status.current.lastFrame = 0;
    },
    [status]
  );

  useEffect(() => {
    const handle = controls.current;
    handle.setPointer = (p) => {
      const now = performance.now();
      const prev = lastPointer.current;
      if (prev) {
        const dt = Math.max(1, now - prev.t);
        const dist = Math.hypot(p[0] - prev.x, p[1] - prev.y);
        strength.current = Math.min(TUNING.MAX_STRENGTH, strength.current + (dist / dt) * TUNING.MOTION_GAIN);
      }
      lastPointer.current = { t: now, x: p[0], y: p[1] };
      mouseTarget.current.set(p[0], p[1]);
    };
    handle.clearPointer = () => {
      lastPointer.current = null;
    };
    handle.reveal = (stepMs = TUNING.WORD_STEP, fadeMs = TUNING.WORD_FADE) => {
      stepMsRef.current = stepMs;
      fadeMsRef.current = fadeMs;
      revealStart.current = performance.now();
      revealDoneFired.current = false;
      phase.current = "revealing";
    };
    return () => {
      handle.setPointer = undefined;
      handle.clearPointer = undefined;
      handle.reveal = undefined;
    };
  }, [controls]);

  useFrame((state, delta) => {
    const now = performance.now();
    // Heartbeat: the parent's watchdog hides the DOM text ONLY while frames keep
    // arriving. If this loop ever stalls, the headline reappears within ~250ms.
    status.current.lastFrame = now;
    if (!painted.current) {
      painted.current = true;
      onActive?.();
    }
    const dt = Math.min(delta, 0.05);

    // Word-by-word entrance: repaint the texture while words are fading in.
    if (phase.current === "revealing") {
      renderTexture(now);
      const last = words.current.length - 1;
      if (now >= revealStart.current + last * stepMsRef.current + fadeMsRef.current) {
        phase.current = "done";
        renderTexture(now);
        if (!revealDoneFired.current) {
          revealDoneFired.current = true;
          onRevealDone?.();
        }
      }
    }

    // Motion-driven warp: decays to 0 when the pointer stops → crisp.
    uniforms.uTime.value = state.clock.elapsedTime * TUNING.FLOW_SPEED;
    strength.current *= Math.exp(-dt / Math.max(TUNING.MOTION_DECAY, 1e-4));
    if (strength.current < 0.001) strength.current = 0;
    uniforms.uStrength.value = strength.current;
    mouse.current.lerp(mouseTarget.current, 1 - Math.exp(-dt / Math.max(TUNING.MOUSE_TRAIL, 1e-4)));
    uniforms.uMouse.value.copy(mouse.current);
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        args={[
          {
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: false,
            depthWrite: false,
          },
        ]}
      />
    </ScreenQuad>
  );
}

export default function LiquidTextGL(props: GLProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      // preserveDrawingBuffer: with a false buffer the browser may clear the canvas
      // after compositing, so any frame that lingers on screen could go blank.
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene {...props} />
    </Canvas>
  );
}
