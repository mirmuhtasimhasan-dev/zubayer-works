"use client";
/**
 * <InteractiveFish /> — a canvas fish that swims around its PARENT box. It wanders
 * on its own and eagerly chases the cursor when the mouse moves inside the box.
 * Faint ink so it reads as ambient behind the content. Drop it inside a
 * position:relative box; it's pointer-events:none so it never blocks clicks or the
 * existing liquid ripple hover.
 */
import { useEffect, useRef } from "react";

/* ─────────────── Tunable (edit these) ─────────────── */
const SIZE = 46; // fish length (px)
const COUNT = 2; // fish per box
const WANDER_SPEED = 0.55; // idle cruising speed
const FOLLOW_SPEED = 2.0; // chase speed when the mouse is inside
const FOLLOW_ACCEL = 0.16; // how snappily it steers toward the cursor (0..1)
const WANDER_ACCEL = 0.04; // gentle steering while wandering
const TURN_EASE = 0.16; // heading easing toward its velocity
const SEPARATION_DISTANCE = 74; // px — fish keep at least this gap between each other
const SEPARATION_STRENGTH = 0.6; // how firmly they steer apart when closer than that
const HOVER_SCALE = 1.4; // how much bigger the fish grows while the mouse is inside
const OPACITY = 0.16; // fish ink opacity (ambient)
const INK = "26, 24, 20"; // ink RGB
const PAPER = "247, 244, 238"; // paper RGB (eye)
/* ──────────────────────────────────────────────────── */

interface Fish {
  x: number; y: number; vx: number; vy: number;
  heading: number; phase: number; swim: number; wander: number; fade: number; scale: number;
}

function easeAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}
// Body half-thickness along the length (0 = head, 1 = tail base).
function halfWidth(u: number) {
  return 0.02 + 0.15 * Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.82));
}

function drawFish(ctx: CanvasRenderingContext2D, f: Fish) {
  const L = SIZE * f.scale;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.heading);
  ctx.globalAlpha = OPACITY * f.fade;
  ctx.fillStyle = `rgb(${INK})`;

  const amp = L * (0.05 + 0.13 * f.swim); // undulation grows with speed
  const N = 18;
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  let tail: [number, number] = [0, 0];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = L * 0.5 - u * L; // head at +L/2, tail base at -L/2
    const bend = 0.25 + u * u; // more sway toward the tail
    const y = Math.sin(f.phase - u * 4.3) * amp * bend;
    const hw = halfWidth(u) * L;
    top.push([x, y - hw]);
    bot.push([x, y + hw]);
    if (i === N) tail = [x, y];
  }
  // body
  ctx.beginPath();
  ctx.moveTo(top[0][0], top[0][1]);
  for (let i = 1; i < top.length; i++) ctx.lineTo(top[i][0], top[i][1]);
  for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
  ctx.closePath();
  ctx.fill();

  // forked tail (sways more than the body)
  const tSway = Math.sin(f.phase - 4.3) * amp * 1.5;
  const tl = L * 0.3;
  const th = L * 0.2;
  ctx.beginPath();
  ctx.moveTo(tail[0], tail[1]);
  ctx.lineTo(tail[0] - tl, tail[1] + tSway - th);
  ctx.lineTo(tail[0] - tl * 0.6, tail[1] + tSway * 0.5);
  ctx.lineTo(tail[0] - tl, tail[1] + tSway + th);
  ctx.closePath();
  ctx.fill();

  // dorsal fin (top, ~1/3 back)
  const du = 0.3;
  const dx = L * 0.5 - du * L;
  const dy = Math.sin(f.phase - du * 4.3) * amp * (0.25 + du * du);
  const dhw = halfWidth(du) * L;
  ctx.beginPath();
  ctx.moveTo(dx + L * 0.06, dy - dhw);
  ctx.lineTo(dx - L * 0.02, dy - dhw - L * 0.16);
  ctx.lineTo(dx - L * 0.12, dy - dhw);
  ctx.closePath();
  ctx.fill();

  // pectoral fin (under, near head)
  const pu = 0.24;
  const px = L * 0.5 - pu * L;
  const py = Math.sin(f.phase - pu * 4.3) * amp * (0.25 + pu * pu);
  const phw = halfWidth(pu) * L;
  ctx.beginPath();
  ctx.moveTo(px, py + phw * 0.5);
  ctx.lineTo(px - L * 0.12, py + phw + L * 0.11);
  ctx.lineTo(px - L * 0.02, py + phw);
  ctx.closePath();
  ctx.fill();

  // eye (light dot near the head)
  ctx.fillStyle = `rgb(${PAPER})`;
  ctx.beginPath();
  ctx.arc(L * 0.33, -L * 0.03, L * 0.035, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export default function InteractiveFish({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const calm = reduce ? 0.5 : 1;

    let W = 0;
    let H = 0;
    const resize = () => {
      const r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const fishes: Fish[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * WANDER_SPEED, vy: (Math.random() - 0.5) * WANDER_SPEED,
      heading: Math.random() * Math.PI * 2, phase: Math.random() * Math.PI * 2,
      swim: 0.4, wander: Math.random() * Math.PI * 2, fade: 0, scale: 1,
    }));

    const mouse = { x: 0, y: 0, active: false };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerup", onLeave);
    host.addEventListener("pointercancel", onLeave);

    const ro = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    ro?.observe(host);
    window.addEventListener("resize", resize);

    let raf = 0;
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      const edge = Math.min(W, H) * 0.22 + 16;
      for (const f of fishes) {
        f.fade = Math.min(1, f.fade + 0.02);
        // Grow a little while the mouse is inside the card, ease back otherwise.
        f.scale += ((mouse.active ? HOVER_SCALE : 1) - f.scale) * 0.08;
        if (mouse.active) {
          const dx = mouse.x - f.x;
          const dy = mouse.y - f.y;
          const d = Math.hypot(dx, dy) || 1;
          f.vx += ((dx / d) * FOLLOW_SPEED * calm - f.vx) * FOLLOW_ACCEL;
          f.vy += ((dy / d) * FOLLOW_SPEED * calm - f.vy) * FOLLOW_ACCEL;
        } else {
          f.wander += (Math.random() - 0.5) * 0.35;
          f.vx += (Math.cos(f.wander) * WANDER_SPEED * calm - f.vx) * WANDER_ACCEL;
          f.vy += (Math.sin(f.wander) * WANDER_SPEED * calm - f.vy) * WANDER_ACCEL;
        }
        // separation — steer gently away from any other fish that's too close, so
        // they never overlap (works while wandering AND chasing the same cursor).
        let sepX = 0;
        let sepY = 0;
        for (const o of fishes) {
          if (o === f) continue;
          const ox = f.x - o.x;
          const oy = f.y - o.y;
          const od = Math.hypot(ox, oy);
          if (od > 0.001 && od < SEPARATION_DISTANCE) {
            const push = (SEPARATION_DISTANCE - od) / SEPARATION_DISTANCE; // stronger when closer
            sepX += (ox / od) * push;
            sepY += (oy / od) * push;
          }
        }
        f.vx += sepX * SEPARATION_STRENGTH;
        f.vy += sepY * SEPARATION_STRENGTH;
        // soft edges — steer back inside
        if (f.x < edge) f.vx += ((edge - f.x) / edge) * 0.4;
        if (f.x > W - edge) f.vx -= ((f.x - (W - edge)) / edge) * 0.4;
        if (f.y < edge) f.vy += ((edge - f.y) / edge) * 0.4;
        if (f.y > H - edge) f.vy -= ((f.y - (H - edge)) / edge) * 0.4;

        f.x = Math.max(2, Math.min(W - 2, f.x + f.vx));
        f.y = Math.max(2, Math.min(H - 2, f.y + f.vy));

        const sp = Math.hypot(f.vx, f.vy);
        if (sp > 0.02) f.heading = easeAngle(f.heading, Math.atan2(f.vy, f.vx), TURN_EASE);
        f.swim = Math.max(0.25, Math.min(1, sp / FOLLOW_SPEED));
        f.phase += (0.2 + f.swim * 0.4) * calm;
        drawFish(ctx, f);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerup", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
    />
  );
}
