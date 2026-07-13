"use client";
/**
 * Two controls, one audio state (see <MusicProvider>):
 *
 *   <SoundCorner> — SAFETY NET. A permanent, low-contrast toggle in a fixed
 *     corner. Always rendered, always reachable, on every device. Music you
 *     cannot switch off is a bug, so this never goes away.
 *
 *   <SoundPill> — the flourish. A pill that drifts in beside the cursor now and
 *     then, offers the music, and fades away. Fine-pointer only (a phone has no
 *     cursor for it to follow) and never on prefers-reduced-motion. It stops
 *     offering once the visitor has decided — it must not nag.
 *
 * Neither renders if the track failed to load.
 */
import { useEffect, useRef, useState } from "react";
import { useMusic } from "./MusicProvider";

/* ─────────────── Tunable (the pill's rhythm) ─────────────── */
const FIRST_APPEAR_DELAY = 2500; // ms after the first mouse move
const VISIBLE_DURATION = 5000; // ms it stays
const REPEAT_GAP = 20000; // ms before it offers again (only while undecided)
const AFTER_TOGGLE_LINGER = 1200; // ms it stays after being clicked
const OFFSET_X = 22; // px from the cursor — clear of the cursor dot
const OFFSET_Y = 18;
const LAG = 0.14; // 0..1 per frame; smaller = more trailing
/* ─────────────────────────────────────────────────────────── */

function Equalizer({ on }: { on: boolean }) {
  return (
    <span className={`snd-eq ${on ? "is-on" : ""}`} aria-hidden>
      <i /><i /><i /><i />
    </span>
  );
}

/** Always present. The one control that can never be missed. */
export function SoundCorner() {
  const { available, playing, toggle } = useMusic();
  if (!available) return null;
  return (
    <button
      type="button"
      className="snd-corner"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute background music" : "Unmute background music"}
    >
      <Equalizer on={playing} />
      <span className="snd-corner-label">{playing ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

/** Drifts in beside the cursor from time to time. Desktop only. */
export function SoundPill() {
  const { available, playing, decided, toggle } = useMusic();
  const ref = useRef<HTMLButtonElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [shown, setShown] = useState(false);

  // Fine pointer + motion allowed, or this component simply does not exist.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(mq.matches && !reduce.matches);
    update();
    mq.addEventListener?.("change", update);
    reduce.addEventListener?.("change", update);
    return () => {
      mq.removeEventListener?.("change", update);
      reduce.removeEventListener?.("change", update);
    };
  }, []);

  // Follow the cursor with the same soft lag as the dot.
  useEffect(() => {
    if (!enabled || !available) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let started = false;
    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX + OFFSET_X;
      target.y = e.clientY + OFFSET_Y;
      if (!started) { started = true; pos.x = target.x; pos.y = target.y; } // no fly-in
    };
    const tick = () => {
      pos.x += (target.x - pos.x) * LAG;
      pos.y += (target.y - pos.y) * LAG;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [enabled, available]);

  // The appearing / lingering / leaving rhythm. Only offers while undecided.
  useEffect(() => {
    if (!enabled || !available || decided) {
      setShown(false);
      return;
    }
    const timers: number[] = [];
    let cancelled = false;

    const cycle = (delay: number) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setShown(true);
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              setShown(false);
              cycle(REPEAT_GAP);
            }, VISIBLE_DURATION)
          );
        }, delay)
      );
    };

    // Wait for a first mouse move — there is no point offering before the visitor
    // is actually here with a cursor.
    const onFirstMove = () => cycle(FIRST_APPEAR_DELAY);
    window.addEventListener("mousemove", onFirstMove, { once: true, passive: true });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("mousemove", onFirstMove);
    };
  }, [enabled, available, decided]);

  // After a click the pill says its piece, then goes.
  useEffect(() => {
    if (!decided || !shown) return;
    const t = window.setTimeout(() => setShown(false), AFTER_TOGGLE_LINGER);
    return () => clearTimeout(t);
  }, [decided, shown]);

  if (!enabled || !available) return null;

  return (
    <button
      ref={ref}
      type="button"
      className={`snd-pill ${shown ? "is-shown" : ""}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute background music" : "Unmute background music"}
      // Only clickable while it is actually on screen; never blocks the page.
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      <Equalizer on={playing} />
      <span className="snd-pill-label">{playing ? "Sound on" : "Sound on?"}</span>
    </button>
  );
}
