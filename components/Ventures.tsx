"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
import MotionHover from "./MotionHover";
import { sanityImage } from "@/sanity/lib/image";

// "The Ventures" is the small kicker; the headline is the line that carries the idea.
const KICKER = "The Ventures";
const TITLE = "Thoughts in Motion";

// A short, readable label from a URL: the host without protocol/www/path. YouTube
// hosts read nicer as the brand name.
function linkLabel(url: string) {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
  host = host.replace(/^www\./, "");
  if (/(^|\.)youtube\.com$/.test(host) || host === "youtu.be") return "YouTube";
  return host;
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21C9.5 18.5 8.2 15.3 8.2 12S9.5 5.5 12 3z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.3V8.7l6 3.3-6 3.3z" />
    </svg>
  );
}

const BG_IMG = { widths: [560, 800, 1100], sizes: "(max-width:1000px) 100vw, 33vw" };

// The website + YouTube link pills — their own anchors, clickable above the
// stretched card link. `variant` styles them for the plain card or the dark scrim.
function LinkPills({ v, variant }: { v: any; variant: "plain" | "photo" }) {
  if (!v.websiteUrl && !v.youtubeUrl) return null;
  const cls = variant === "photo" ? "vc-pill" : "venture-ext";
  const lab = variant === "photo" ? "vc-pill-label" : "venture-ext-label";
  // stopPropagation so a pill tap opens the link, not the card's own navigation.
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <>
      {v.websiteUrl && (
        <a className={cls} href={v.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${v.name} website`} onClick={stop}>
          <GlobeIcon />
          <span className={lab}>{linkLabel(v.websiteUrl)}</span>
        </a>
      )}
      {v.youtubeUrl && (
        <a className={cls} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${v.name} on YouTube`} onClick={stop}>
          <YouTubeIcon />
          <span className={lab}>{linkLabel(v.youtubeUrl)}</span>
        </a>
      )}
    </>
  );
}

// NEW: full-bleed photo + right scrim + right text (Montserrat). The background
// photo RIPPLES on hover (MotionHover, the same liquid effect as the Eye/gallery
// tiles). Navigation is a click on the card itself (not a stretched <a>) so the
// ripple layer underneath receives the hover; the pills stopPropagation.
function PhotoCard({ v }: { v: any }) {
  const router = useRouter();
  const href = `/ventures/${v.slug || v.id}`;
  const src = sanityImage(v.backgroundImage, BG_IMG).src || "";
  return (
    <div
      className="venture-card vc-photo"
      role="link"
      tabIndex={0}
      aria-label={v.name}
      // Match the card to the photo's own aspect ratio so the WHOLE image shows
      // (no crop). Falls back to a wide banner if the ratio is unknown.
      style={{ aspectRatio: v.backgroundImage?.aspect || 16 / 9 }}
      onClick={() => router.push(href)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(href); } }}
    >
      <div className="vc-bg">
        {src && <MotionHover type="image" src={src} holdBase activateOnHover style={{ position: "absolute", inset: 0 }} />}
      </div>
      <div className="vc-scrim" aria-hidden />
      <div className="vc-content">
        {v.kicker && <span className="vc-kicker">{v.kicker}</span>}
        <h3 className="vc-title">{v.name}</h3>
        {v.shortText && <p className="vc-short">{v.shortText}</p>}
        {v.description && <p className="vc-desc">{v.description}</p>}
        <div className="vc-controls">
          <LinkPills v={v} variant="photo" />
          <span className="vc-arrow" aria-hidden>&#8594;</span>
        </div>
      </div>
    </div>
  );
}

// EXISTING plain card (fallback for ventures with no background photo) — the same
// LiquidHover ripple and layout as before.
function PlainCard({ v }: { v: any }) {
  return (
    <div className="venture-card">
      <LiquidHover className="venture-card-liquid" contentClassName="venture-box">
        <div className="venture-head">
          {v.kicker && <span className="venture-card-kicker">{v.kicker}</span>}
          <h3 className="venture-card-name">{v.name}</h3>
        </div>
        {v.tagline && <p className="venture-card-tag">{v.tagline}</p>}
        {v.description && <p className="venture-card-desc">{v.description}</p>}
        {(v.websiteUrl || v.youtubeUrl) && (
          <div className="venture-links">
            <LinkPills v={v} variant="plain" />
          </div>
        )}
        <span className="venture-more">
          <span className="vm-text">Learn more</span>
          <span className="vm-arrow" aria-hidden>&#8594;</span>
        </span>
        <Link href={`/ventures/${v.slug || v.id}`} className="venture-stretch" aria-label={v.name} />
      </LiquidHover>
    </div>
  );
}

export default function Ventures({ ventures }: { ventures: any[] }) {
  if (!ventures?.length) return null;
  return (
    <section className="section" id="ventures">
      <div className="ven-head">
        <Reveal><p className="eyebrow">{KICKER}</p></Reveal>
        <Reveal><h2 className="ven-title">{TITLE}</h2></Reveal>
      </div>
      <div className="ventures-grid">
        {ventures.map((v) =>
          v.backgroundImage?.asset ? (
            <Reveal key={v.id} className="venture-cell">
              <PhotoCard v={v} />
            </Reveal>
          ) : (
            <Reveal key={v.id} className="venture-cell">
              <PlainCard v={v} />
            </Reveal>
          )
        )}
      </div>
    </section>
  );
}
