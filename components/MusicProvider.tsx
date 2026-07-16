"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ─────────────── Tunable ─────────────── */
// Drop the track at the first path. The rest are fallbacks, tried in order, so a
// .wav / .ogg master works without touching the code.
const SOURCES = ["/audio/ambient.mp3", "/audio/ambient.wav", "/audio/ambient.ogg"];
const STORAGE_KEY = "zw-music";
const TARGET_VOLUME = 0.32; // ambient, never intrusive
const FADE_MS = 700; // volume fade in/out
/* ─────────────────────────────────────── */

interface MusicState {
  /** The track loaded — if false, render no controls at all. */
  available: boolean;
  playing: boolean;
  /** The visitor has explicitly chosen — used to stop the pill nagging. */
  decided: boolean;
  toggle: () => void;
}

const Ctx = createContext<MusicState>({
  available: false,
  playing: false,
  decided: false,
  toggle: () => {},
});

export const useMusic = () => useContext(Ctx);

export default function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef(0);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [decided, setDecided] = useState(false);

  // Create the element once. It is never mounted in the tree — nothing to style.
  // Walk the source list until one decodes; if none does, `available` stays false
  // and no control renders.
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    audioRef.current = a;

    let i = 0;
    const ready = () => setAvailable(true);
    const failed = () => {
      i += 1;
      if (i < SOURCES.length) {
        a.src = SOURCES[i];
        a.load();
      } else {
        setAvailable(false);
      }
    };
    a.addEventListener("canplay", ready);
    a.addEventListener("loadeddata", ready);
    a.addEventListener("error", failed);
    a.src = SOURCES[0];

    // NOTE: `decided` is SESSION-only — it starts false each visit so the cursor
    // pill offers again, and only stops nagging once the visitor acts THIS visit.
    // (The stored preference still drives audio resume below, separately.)

    return () => {
      cancelAnimationFrame(fadeRaf.current);
      a.removeEventListener("canplay", ready);
      a.removeEventListener("loadeddata", ready);
      a.removeEventListener("error", failed);
      a.pause();
      audioRef.current = null;
    };
  }, []);

  // Smooth volume ramp — music should never snap on or off.
  const fadeTo = useCallback((to: number, then?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      // rAF hands us the FRAME's timestamp, which can be a hair EARLIER than the
      // performance.now() we captured when scheduling — so `now - start` goes
      // negative on the first frame. Unclamped that drives volume below 0 and
      // HTMLMediaElement throws IndexSizeError. Clamp both the progress and the
      // value.
      const t = Math.min(1, Math.max(0, (now - start) / FADE_MS));
      a.volume = Math.min(1, Math.max(0, from + (to - from) * t));
      if (t < 1) fadeRaf.current = requestAnimationFrame(step);
      else then?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return false;
    try {
      await a.play();
    } catch {
      return false; // blocked until a real gesture
    }
    fadeTo(TARGET_VOLUME);
    setPlaying(true);
    return true;
  }, [fadeTo]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    fadeTo(0, () => a.pause());
    setPlaying(false);
  }, [fadeTo]);

  const toggle = useCallback(() => {
    setDecided(true);
    if (playing) {
      stop();
      try { localStorage.setItem(STORAGE_KEY, "off"); } catch {}
    } else {
      void start();
      try { localStorage.setItem(STORAGE_KEY, "on"); } catch {}
    }
  }, [playing, start, stop]);

  // Returning visitor who had it on: autoplay is blocked, so wait for their first
  // gesture of the visit and pick up where they left off. One shot, then gone.
  useEffect(() => {
    if (!available || playing) return;
    let stored: string | null = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
    if (stored !== "on") return;

    const resume = () => { void start(); };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", resume, opts);
    window.addEventListener("keydown", resume, opts);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [available, playing, start]);

  return <Ctx.Provider value={{ available, playing, decided, toggle }}>{children}</Ctx.Provider>;
}
