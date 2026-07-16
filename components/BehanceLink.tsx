"use client";
/**
 * <BehanceLink> — a compact "expanding circle" link to the Behance archive.
 *
 * At rest it is a small OUTLINED circle showing just the Behance logo. It fills
 * with the ventures-card tone and expands into a pill revealing "See the full
 * archive ->" on hover / keyboard focus (desktop), or on the FIRST TAP (touch —
 * that tap only opens it; the second tap follows the link). The width growth
 * lives in its own flex item so neighbours never reflow. Colours + speed are
 * tunable CSS vars on `.bhl` (see globals.css).
 */
import { useEffect, useState } from "react";

// The official Behance mark (Simple Icons), inlined; fill=currentColor so it takes
// the rest colour and inverts once the pill fills.
function BehanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  );
}

export default function BehanceLink({ href, className = "" }: { href: string; className?: string }) {
  const [touch, setTouch] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches);
  }, []);

  // Touch has no hover, so the first tap opens the pill instead of navigating;
  // once open, a second tap follows the link. Desktop is untouched (hover/focus).
  const onClick = (e: React.MouseEvent) => {
    if (touch && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <a
      className={`bhl ${open ? "is-open" : ""} ${className}`.trim()}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="See the full archive on Behance"
      aria-expanded={touch ? open : undefined}
      onClick={onClick}
    >
      <span className="bhl-icon"><BehanceIcon /></span>
      <span className="bhl-label">See the full archive <span aria-hidden>&#8594;</span></span>
    </a>
  );
}
