"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* ─────────────── Tunable (the Engagements dropdown) ─────────────── */
// Sub-items live in an array so more can be added later (Partnerships, Speaking…);
// each stacks as another row in the same wide panel.
const ENGAGEMENTS_SUBNAV: SubItem[] = [{ label: "Affiliates", href: "/engagements/affiliates" }];
/* ────────────────────────────────────────────────────────────────── */

type SubItem = { label: string; href: string };
type NavItem = { label: string; href: string; sub?: SubItem[] };

// About is its own page (/about); the rest are sections on the home page. Using
// "/#section" (not "#section") so they also work from other pages like /about.
const LINKS: NavItem[] = [
  { label: "Gallery", href: "/gallery" },
  { label: "Ventures", href: "/#ventures" },
  { label: "Writing", href: "/#writing" },
  { label: "Engagements", href: "/#services", sub: ENGAGEMENTS_SUBNAV },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

/**
 * Desktop-only disclosure: Engagements is a real link to its section AND reveals a
 * wide arrow panel of sub-items on hover / focus.
 *
 * The VISUAL open/close is pure CSS — `.nde:hover` / `.nde:focus-within` — because
 * the panel is a DOM child of the container (so `:hover` stays true over the panel
 * and its transparent bridge). That is flicker-free: no JS timers or re-renders
 * race the pointer. JS only handles the extras a11y needs: syncing aria-expanded,
 * ArrowDown-to-first-item, and Escape (which force-hides via `is-suppressed` even
 * while the cursor still hovers, cleared on the next mouse-enter).
 */
function NavDropdown({ item }: { item: NavItem }) {
  const [expanded, setExpanded] = useState(false); // reflects aria-expanded only
  const [suppressed, setSuppressed] = useState(false); // Escape closed it while hovering
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => { setExpanded(false); setSuppressed(false); }, [pathname]);

  // Escape force-closes and returns focus to the trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (expanded || containerRef.current?.contains(document.activeElement)) {
        setSuppressed(true);
        setExpanded(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  const onEnter = () => { setSuppressed(false); setExpanded(true); };
  const onLeave = () => setExpanded(false);
  const onFocus = () => { if (!suppressed) setExpanded(true); };
  const onBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) { setExpanded(false); setSuppressed(false); }
  };
  const onTriggerKey = (e: React.KeyboardEvent) => {
    // ArrowDown / Space open the panel and move focus in; Enter follows the link.
    if (e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      setSuppressed(false);
      setExpanded(true);
      requestAnimationFrame(() => firstItemRef.current?.focus());
    }
  };

  return (
    <div
      ref={containerRef}
      className={`nde ${suppressed ? "is-suppressed" : ""}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <a
        ref={triggerRef}
        href={item.href}
        className="nde-trigger"
        aria-haspopup="true"
        aria-expanded={expanded}
        onKeyDown={onTriggerKey}
      >
        {item.label}
        <span className="nde-caret" aria-hidden />
      </a>
      <div className="nde-panel">
        <ul className="nde-card" role="menu" aria-label={item.label}>
          {item.sub!.map((s, i) => (
            <li key={s.href} role="none">
              <a
                ref={i === 0 ? firstItemRef : undefined}
                role="menuitem"
                href={s.href}
                className="nde-item"
                onClick={() => setExpanded(false)}
              >
                <span>{s.label}</span>
                <span className="nde-arrow" aria-hidden>&#8594;</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<string | null>(null); // which mobile accordion is expanded
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
            item.sub ? (
              <NavDropdown key={item.href} item={item} />
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
          {LINKS.map((item, i) => {
            const delay = { transitionDelay: open ? `${i * 55 + 120}ms` : "0ms" };
            if (!item.sub) {
              return (
                <a key={item.href} href={item.href} onClick={close} style={delay}>{item.label}</a>
              );
            }
            // Touch: an accordion, not the hover panel. Tapping the chevron expands
            // the nested sub-items indented below Engagements.
            const expanded = acc === item.href;
            return (
              <div key={item.href} className="mm-acc" style={delay}>
                <div className="mm-acc-head">
                  <a href={item.href} onClick={close}>{item.label}</a>
                  <button
                    className="mm-acc-toggle"
                    aria-expanded={expanded}
                    aria-label={expanded ? `Hide ${item.label} links` : `Show ${item.label} links`}
                    onClick={() => setAcc(expanded ? null : item.href)}
                  >
                    <span className={`mm-chevron ${expanded ? "up" : ""}`} aria-hidden />
                  </button>
                </div>
                <div className={`mm-acc-panel ${expanded ? "open" : ""}`}>
                  {item.sub.map((s) => (
                    <a key={s.href} href={s.href} onClick={close} className="mm-sub">{s.label}</a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
