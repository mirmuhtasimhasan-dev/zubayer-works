"use client";
import { useEffect, useState } from "react";

// About is its own page (/about); the rest are sections on the home page. Using
// "/#section" (not "#section") so they also work from other pages like /about.
// `children` turns an item into a group: a hover dropdown on desktop, indented
// sub-links on mobile.
type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };
const LINKS: NavItem[] = [
  { label: "Gallery", href: "/gallery" },
  { label: "Ventures", href: "/#ventures" },
  { label: "Writing", href: "/#writing" },
  { label: "Engagements", href: "/#services", children: [{ label: "Affiliates", href: "/affiliates" }] },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
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
        <a href="/" className="nav-logo">
          <img src="/logo.png" alt="Zubayer Ahmed" className="nav-logo-img" />
          <img src="/signature.png" alt="" aria-hidden className="nav-sign" />
        </a>

        <div className="nav-links">
          {LINKS.map((item) =>
            item.children ? (
              // Hover to reveal the sub-items; the parent still links to its section.
              <div key={item.href} className="nav-item-has-sub">
                <a href={item.href}>{item.label}</a>
                <div className="nav-sub" role="menu">
                  {item.children.map((c) => (
                    <a key={c.href} href={c.href} role="menuitem">{c.label}</a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={item.href} href={item.href}>{item.label}</a>
            )
          )}
        </div>

        <button className="nav-burger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span />
        </button>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-top">
          <a href="/" className="nav-logo" onClick={close}>
            <img src="/logo.png" alt="Zubayer Ahmed" className="nav-logo-img" />
            <img src="/signature.png" alt="" aria-hidden className="nav-sign" />
          </a>
          <button className="mobile-close" onClick={close} aria-label="Close menu">✕</button>
        </div>
        <div className="mobile-menu-links">
          {/* Flatten parents + their children into one list so each anchor keeps
              its own staggered reveal; sub-items just carry .mobile-sub. */}
          {LINKS.flatMap((item) => [
            { ...item, sub: false },
            ...(item.children || []).map((c) => ({ ...c, sub: true })),
          ]).map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className={item.sub ? "mobile-sub" : ""}
              style={{ transitionDelay: open ? `${i * 55 + 120}ms` : "0ms" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
