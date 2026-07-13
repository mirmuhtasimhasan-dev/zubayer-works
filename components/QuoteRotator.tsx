"use client";
/**
 * <QuoteRotator> — one pull-quote at a time above the Writing section. Each quote
 * materializes with a blur-to-sharp fade, holds, blurs out, and the next comes in
 * (looping). On hover the current quote ripples with the SAME liquid effect as the
 * hero headline — it reuses <LiquidText> in `instant` mode. Reduced-motion swaps
 * without the blur. Fallback + cross-browser behaviour come from LiquidText.
 */
import { useEffect, useRef, useState } from "react";
import LiquidText from "./LiquidText";

const HOLD = 20000; // ms a quote stays sharp (20s each)
const FADE = 750; // ms of the blur-in / blur-out

export default function QuoteRotator({ quotes }: { quotes: string[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const reduce = useRef(false);

  // Entrance for the first quote.
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Rotate: blur out → swap → blur in, forever.
  useEffect(() => {
    if (quotes.length <= 1) return;
    let outT: number | undefined;
    const cycle = window.setInterval(() => {
      setShown(false);
      outT = window.setTimeout(() => {
        setIndex((i) => (i + 1) % quotes.length);
        setShown(true);
      }, reduce.current ? 30 : FADE);
    }, HOLD + FADE);
    return () => { window.clearInterval(cycle); window.clearTimeout(outT); };
  }, [quotes.length]);

  if (!quotes?.length) return null;

  return (
    <div className="quote-block" aria-live="polite">
      <div className={`quote-rot ${shown ? "is-shown" : ""}`}>
        {/* Exactly the hero headline's liquid hover — same <LiquidText>/WebGL, so
            it behaves identically. The quote is shown exactly as written in the
            Studio (no wrapping quote marks are added). */}
        <LiquidText
          key={index}
          as="div"
          className="quote-text"
          text={(quotes[index] || "").trim()}
          instant
          hoverTarget=".quote-rot"
        />
      </div>
    </div>
  );
}
