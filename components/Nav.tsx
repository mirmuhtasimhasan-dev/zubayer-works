"use client";
import { useEffect, useState } from "react";

// About is its own page (/about); the rest are sections on the home page. Using
// "/#section" (not "#section") so they also work from other pages like /about.
const LINKS: [string, string][] = [
  ["About", "/about"],
  ["Ventures", "/#ventures"],
  ["Writing", "/#writing"],
  ["Contact", "/#contact"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a href="/" className="nav-logo">Z. Ahmed</a>

        <div className="nav-links">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </div>

        <button className="nav-burger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span />
        </button>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-top">
          <a href="/" className="nav-logo" onClick={close}>Z. Ahmed</a>
          <button className="mobile-close" onClick={close} aria-label="Close menu">✕</button>
        </div>
        <div className="mobile-menu-links">
          {LINKS.map(([label, href], i) => (
            <a
              key={href}
              href={href}
              onClick={close}
              style={{ transitionDelay: open ? `${i * 60 + 120}ms` : "0ms" }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
