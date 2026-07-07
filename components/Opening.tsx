"use client";
import { useEffect, useRef } from "react";

export default function Opening({ location, headline, subText }: { location: string; headline: string; subText: string; }) {
  const orb = useRef<HTMLDivElement>(null);
  const words = (headline || "").split(" ");
  useEffect(() => {
    const el = orb.current;
    if (!el || window.innerWidth < 700) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <header className="opening" id="top">
      <div className="orb" ref={orb}></div>
      <p className="op-loc">{location}</p>
      <h1 className="op-head">
        {words.map((w, i) => (<span key={i} className="word" style={{ animationDelay: `${700 + i * 140}ms` }}>{w}&nbsp;</span>))}
      </h1>
      <p className="op-sub">{subText}</p>
    </header>
  );
}
