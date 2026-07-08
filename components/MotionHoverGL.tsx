"use client";
/**
 * MotionHoverGL — the WebGL half of <MotionHover>.
 *
 * A full-canvas quad samples the media (VideoTexture or image Texture) through a
 * simplex-noise + mouse displacement. The canvas is LARGER than the media box
 * (the parent overlay overhangs by `spill`), and the media is mapped to the
 * CENTRE region — so when the displacement pushes sampling into the surrounding
 * margin, the warped content and edges BLEED OUTSIDE the original frame.
 *
 * The distortion is MOTION-driven: pointer movement builds it up, holding still
 * lets it decay back to calm.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import * as THREE from "three";

export interface MHControls {
  setHover?: (h: boolean) => void;
  setPointer?: (uv: [number, number]) => void;
}

interface GLProps {
  getMedia: () => HTMLVideoElement | HTMLImageElement | null;
  type: "video" | "image";
  controls: React.MutableRefObject<MHControls>;
  onFirstFrame?: () => void;
  spill: number; // fraction of the box that bleeds out each side
  ambient: number; // idle ripple 0..1 (0 = calm until moved)
  amplitude: number;
  noiseScale: number;
  flowSpeed: number;
  mouseRadius: number;
  motionGain: number; // pointer speed → distortion (higher = more sensitive)
  motionDecay: number; // seconds to settle back to calm after the pointer stops
  base: number; // how much the WHOLE media warps vs. only under the cursor (0..1)
  pull: number; // how strongly the flow leans toward the cursor
}

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
  uniform float uTime, uStrength, uAmp, uNoiseScale, uRadius, uBase, uPull, uSpill;
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

  void main() {
    // plane uv (0..1 over the full, overhanging canvas) -> media uv (centre box)
    vec2 muv = (vUv - uSpill) / (1.0 - 2.0 * uSpill);

    vec2 q = muv * uNoiseScale;
    vec2 flow = vec2(snoise(q + vec2(uTime, 0.0)), snoise(q + vec2(0.0, uTime)));
    flow += 0.35 * vec2(snoise(q * 2.1 + vec2(uTime * 1.3, 10.0)), snoise(q * 2.1 + vec2(10.0, uTime * 1.1)));

    float prox = 1.0 - smoothstep(0.0, uRadius, distance(muv, uMouse));
    float amp = uAmp * uStrength * mix(uBase, 1.0, prox);

    vec2 disp = flow * amp;
    disp += normalize(uMouse - muv + 1e-5) * prox * uPull * uStrength * uAmp;

    vec2 s = muv + disp;
    vec4 col = texture2D(uTex, clamp(s, 0.0, 1.0));

    // Transparent outside the (warped) media, with a soft edge so it bleeds cleanly.
    vec2 m = smoothstep(0.0, 0.01, s) * (1.0 - smoothstep(0.99, 1.0, s));
    col.a *= m.x * m.y;
    gl_FragColor = col;
  }
`;

function Scene({
  getMedia, type, controls, onFirstFrame, spill, ambient,
  amplitude, noiseScale, flowSpeed, mouseRadius, motionGain, motionDecay, base, pull,
}: GLProps) {
  const invalidate = useThree((s) => s.invalidate);
  const texture = useRef<THREE.Texture | null>(null);
  const painted = useRef(false);

  // Motion-driven strength.
  const strength = useRef(0);
  const lastPointer = useRef<{ t: number; x: number; y: number } | null>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));

  const uSpill = spill / (1 + 2 * spill);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSpill: { value: uSpill },
      uAmp: { value: amplitude },
      uNoiseScale: { value: noiseScale },
      uRadius: { value: mouseRadius },
      uBase: { value: base },
      uPull: { value: pull },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const m = getMedia();
    if (!m) return;
    let tex: THREE.Texture;
    if (type === "video") {
      tex = new THREE.VideoTexture(m as HTMLVideoElement);
    } else {
      const img = m as HTMLImageElement;
      tex = new THREE.Texture(img);
      if (img.complete && img.naturalWidth) tex.needsUpdate = true;
      else img.addEventListener("load", () => { tex.needsUpdate = true; invalidate(); }, { once: true });
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    texture.current = tex;
    uniforms.uTex.value = tex;
    invalidate();
    return () => tex.dispose();
  }, [getMedia, type, uniforms, invalidate]);

  useEffect(() => {
    const c = controls.current;
    c.setPointer = (uv) => {
      // Build strength from pointer SPEED (uv/ms). Holding still adds nothing.
      const now = performance.now();
      const prev = lastPointer.current;
      if (prev) {
        const dt = Math.max(1, now - prev.t);
        const dist = Math.hypot(uv[0] - prev.x, uv[1] - prev.y);
        strength.current = Math.min(1.3, strength.current + (dist / dt) * motionGain);
      }
      lastPointer.current = { t: now, x: uv[0], y: uv[1] };
      mouseTarget.current.set(uv[0], uv[1]);
      invalidate();
    };
    c.setHover = (h) => { if (!h) lastPointer.current = null; invalidate(); };
    return () => { c.setPointer = undefined; c.setHover = undefined; };
  }, [controls, invalidate, motionGain]);

  useFrame((state, delta) => {
    if (!painted.current && texture.current) { painted.current = true; onFirstFrame?.(); }
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value = state.clock.elapsedTime * flowSpeed;

    strength.current *= Math.exp(-dt / Math.max(motionDecay, 1e-4));
    if (strength.current < 0.001) strength.current = 0;
    const eff = Math.max(strength.current, ambient);
    uniforms.uStrength.value = eff;
    mouse.current.lerp(mouseTarget.current, 1 - Math.exp(-dt / 0.12));
    uniforms.uMouse.value.copy(mouse.current);

    // Image mode is demand-driven: keep rendering only while there's motion.
    if (type === "image" && eff > 0.001) invalidate();
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        args={[{ uniforms, vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false }]}
      />
    </ScreenQuad>
  );
}

export default function MotionHoverGL(props: GLProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={props.type === "video" ? "always" : "demand"}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene {...props} />
    </Canvas>
  );
}
