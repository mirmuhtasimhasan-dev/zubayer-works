"use client";
import { useEffect, useRef, useState } from "react";
import LiquidText from "@/components/LiquidText";

/* ─────────────── Tunable (desktop is the reference) ─────────────── */
const HEAD_ENTRANCE = 1.2; // s — the headline's LiquidText reveal delay
/* The kicker + subtitle timing now lives in CSS (.op-loc / .op-sub animation
   delays: .6s and 1.45s — exactly the old JS values, so desktop is unchanged).
   They used to be JS setTimeout/onRevealComplete, which only START AFTER
   HYDRATION: on a slow phone that lands ~3s late, long after the CSS
   blur-to-sharp headline has already settled, so the intro looked like it
   replayed. Driving everything from CSS means one clock, starting at first
   paint, identical on every device — and it can only ever play once. */
/* ───────────────────────────────────────────────────────────────── */

// Module scope: survives a remount/hydration within the same page load, so the
// intro can never run a second time.
let introPlayed = false;

export default function Opening({ location, headline, subText }: { location: string; headline: string; subText: string; }) {
  const orb = useRef<HTMLDivElement>(null);
  // Already played this page load? Render the final hero with no entrance.
  const [done] = useState(() => introPlayed);

  useEffect(() => {
    introPlayed = true;
  }, []);

  // Orb mouse parallax (desktop, motion allowed). Deliberately independent of the
  // intro: resize / orientation / video / sound can never restart the sequence,
  // because the sequence is CSS and runs off first paint only.
  useEffect(() => {
    const el = orb.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.innerWidth < 700 || reduce) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header className={`opening ${done ? "intro-done" : ""}`} id="top">
      <div className="orb" ref={orb}></div>
      <p className="op-loc">{location}</p>
      <LiquidText as="h1" className="op-head" text={headline} entranceDelay={HEAD_ENTRANCE} />
      <p className="op-sub">{subText}</p>
      {/* Scroll cue — also a link down to the first section. Fades in last. */}
      <a href="#work" className="op-scroll" aria-label="Scroll down">
        <span className="op-scroll-arrow" aria-hidden>&darr;</span>
        <span>Scroll</span>
      </a>
    </header>
  );
}
