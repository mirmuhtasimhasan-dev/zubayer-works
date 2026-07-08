"use client";
import { useEffect, useRef } from "react";
import LiquidText from "@/components/LiquidText";

export default function Opening({ location, headline, subText }: { location: string; headline: string; subText: string; }) {
  const orb = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = orb.current;
    const locEl = locRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Orb mouse parallax (desktop, motion allowed).
    let onMove: ((e: MouseEvent) => void) | null = null;
    if (el && window.innerWidth >= 700 && !reduce) {
      onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };
      window.addEventListener("mousemove", onMove);
    }

    // Entrance sequence: location fades in first (~0.6s), then the headline's
    // blur-in reveal starts (revealDelay ~1.2s, handled inside the component),
    // then the subtext fades in (~2.5s, CSS — see globals).
    const timers: number[] = [];
    if (reduce) {
      if (locEl) locEl.style.opacity = "1";
    } else {
      timers.push(window.setTimeout(() => { if (locEl) locEl.style.opacity = "1"; }, 600));
    }

    return () => {
      if (onMove) window.removeEventListener("mousemove", onMove);
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <header className="opening" id="top">
      <div className="orb" ref={orb}></div>
      <p className="op-loc" ref={locRef} style={{ opacity: 0, transition: "opacity 0.9s ease" }}>{location}</p>
      <LiquidText
        as="h1"
        className="op-head"
        text={headline}
        entranceDelay={1.2}
        onRevealComplete={() => { if (subRef.current) subRef.current.style.opacity = "1"; }}
      />
      <p className="op-sub" ref={subRef} style={{ opacity: 0, transition: "opacity 1s ease" }}>{subText}</p>
    </header>
  );
}
