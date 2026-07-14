"use client";
/**
 * <QuoteRotator> — one pull-quote at a time above the Writing section. Each quote
 * materializes with a blur-to-sharp fade, holds, blurs out, and the next comes in
 * (looping). Reduced-motion swaps without the blur. The quote is plain text: no
 * liquid/WebGL hover, it read as noise on a quote.
 */
import { useEffect, useRef, useState } from "react";

const HOLD = 7000; // ms a quote stays sharp (20s each)
const FADE = 700;// ms of the blur-in / blur-out

/**
 * The attribution is not its own Sanity field — it lives inside the quote string
 * after an em-dash ("… — The Definition of Success"). Split it off so it can be
 * styled separately. Option B (chosen): Cinzel caps, no leading dash.
 */
function splitQuote(raw: string) {
  const s = (raw || "").trim();
  const at = s.lastIndexOf("—");
  if (at < 0) return { text: s, source: "" };
  return { text: s.slice(0, at).trim(), source: s.slice(at + 1).trim() };
}

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

  const { text, source } = splitQuote(quotes[index] || "");

  return (
    <div className="quote-block" aria-live="polite">
      <div className={`quote-rot ${shown ? "is-shown" : ""}`}>
        {/* Set in Cinzel CAPS (see .quote-text): Cinzel is a titling face and its
            lowercase loses the carved-Roman look. */}
        <div className="quote-text">{text}</div>
        {source && <div className="quote-src">{source}</div>}
      </div>
    </div>
  );
}
