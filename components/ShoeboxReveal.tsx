"use client";
/**
 * <ShoeboxReveal> — wraps the Scrappy Scribbles block in a closed kraft-paper
 * cover. Click/tap/Enter pulls a thread along a perforated seam, the two halves
 * split apart, and the real content blurs into focus behind them.
 *
 * PROGRESSIVE ENHANCEMENT — the reason it is built this way:
 *   • The content is server-rendered and ALWAYS in the DOM. It arrives as
 *     `children`; this component only adds the cover and the open state. No data
 *     fetching moves to the client.
 *   • The cover is position:absolute inset:0 inside a position:relative wrapper,
 *     so it always matches the content's size and the section is EXACTLY as tall
 *     open as closed — zero layout shift.
 *   • The cover is a real <button>, so tap, click, Enter and Space all open it,
 *     and screen readers announce it.
 *   • After the open transition the cover is unmounted, so it can never block the
 *     post links or the magnetic button.
 *   • prefers-reduced-motion → no cover at all, content plainly visible.
 *   • No JS → a <noscript> rule hides the cover, so the content still shows.
 *   • Hydration-safe: the server and the first client render are both "closed".
 *     The content's hidden start state is applied on mount (`armed`), while the
 *     opaque cover is already over it — so arming never flashes.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/* ─────────────── Tunable ─────────────── */
// THE BOX'S OWN HEIGHT while closed. Change these two numbers to make the closed
// box shorter or taller — it no longer depends on how tall the content is. The
// content is clipped behind it, and on open the box grows to the content's real
// height and then goes back to `auto`.
const BOX_WIDTH = 820; // px — the closed box is capped at this and centred
const BOX_HEIGHT = 420; // px, desktop
const BOX_HEIGHT_PHONE = 340; // px, <=600px
const PHONE_AT = 600; // px

const OPEN_DURATION = 1100; // ms — the halves' travel; also when the cover unmounts
const KRAFT_FROM = "#eee9df";
const KRAFT_TO = "#DBCBA9";
const COVER_INK = "#3a2c18";
const SEAM_AT = 56; // % of the cover height where the perforation runs
const HOLE_SPACING = 15; // px between punched holes
const HOLE_RADIUS = 3; // px
/* ────────────────────────────────────── */

// Paper grain, inlined so nothing extra is fetched.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function ShoeboxReveal({
  children,
  kicker,
  title,
}: {
  children: ReactNode;
  kicker: string;
  title: string;
}) {
  // Identical on the server and on the first client render — no hydration gap.
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [armed, setArmed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [boxH, setBoxH] = useState(BOX_HEIGHT); // the closed box's own height
  const [openH, setOpenH] = useState<number | null>(null); // the content's real height
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // The closed box has its OWN height — pick the phone value below PHONE_AT.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PHONE_AT}px)`);
    const update = () => setBoxH(mq.matches ? BOX_HEIGHT_PHONE : BOX_HEIGHT);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Reduced motion → never arm, never cover: the section just renders open.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Arm the content's hidden start state ONLY on the client, and only while the
  // cover is there to hide the change.
  useEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  const open = useCallback(() => {
    if (opened) return;
    // Grow the box from its own height to the content's real height, so nothing is
    // left clipped. After the transition the height goes back to `auto` (below),
    // which is what lets "Show more" expand the section later.
    setOpenH(contentRef.current?.scrollHeight ?? null);
    setOpened(true);
    // Unmount the cover once it has finished leaving, so it can never sit over
    // the post links or the magnetic button.
    timer.current = window.setTimeout(() => setCoverGone(true), OPEN_DURATION + 250);
    // Keep keyboard / screen-reader users where they were: land on the heading.
    window.setTimeout(() => {
      wrapRef.current?.querySelector<HTMLElement>(".wr-title")?.focus();
    }, 600);
  }, [opened]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showCover = !reduced && !coverGone;

  // Reduced motion / no cover left -> the section is simply its natural height.
  // Closed -> the box's OWN height (content clipped behind it).
  // Opening -> grow to the content's measured height.
  const height = reduced || coverGone ? undefined : opened ? (openH ?? undefined) : boxH;

  return (
    <div
      ref={wrapRef}
      className={`sbx${armed && !reduced ? " armed" : ""}${opened ? " is-open" : ""}${
        coverGone || reduced ? " is-done" : ""
      }`}
      style={
        {
          ...(height !== undefined ? { height: `${height}px` } : null),
          "--sbx-w": `${BOX_WIDTH}px`,
          "--sbx-dur": `${OPEN_DURATION}ms`,
          "--sbx-kraft-from": KRAFT_FROM,
          "--sbx-kraft-to": KRAFT_TO,
          "--sbx-ink": COVER_INK,
          "--sbx-seam": `${SEAM_AT}%`,
          "--sbx-hole-gap": `${HOLE_SPACING}px`,
          "--sbx-hole-r": `${HOLE_RADIUS}px`,
          "--sbx-grain": GRAIN,
        } as React.CSSProperties
      }
    >
      {/* The real, server-rendered content. Always in the DOM. */}
      <div ref={contentRef} className="sbx-content">
        {children}
      </div>

      {showCover && (
        <button
          type="button"
          className="sbx-cover"
          onClick={open}
          aria-label="Open Scrappy Scribbles"
          aria-expanded={opened}
        >
          {/* Every decorative layer is inert; the button itself takes the tap. */}
          <span className="sbx-half sbx-top" aria-hidden>
            <span className="sbx-grain" />
            <span className="sbx-hint">
              <i className="sbx-dot" />
              click to open
            </span>
            <span className="sbx-label">
              <span className="sbx-label-k">{kicker}</span>
              <span className="sbx-label-t">{title}</span>
            </span>
          </span>

          <span className="sbx-half sbx-bottom" aria-hidden>
            <span className="sbx-grain" />
            {/* The lower half was blank kraft; the date stamps it like a real box. */}
            <span className="sbx-since">Since 1997</span>
          </span>

          {/* The seam sits above both halves: just the punched holes. The drawn
              thread and its knot were too heavy a mark across the lid, so the
              perforation alone reads as "this tears open". */}
          <span className="sbx-perf" aria-hidden />
        </button>
      )}

      {/* No JS: the cover is in the server markup, so take it away. */}
      <noscript>
        <style>{`.sbx-cover{display:none!important}.sbx .sbx-content>*{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>
    </div>
  );
}
