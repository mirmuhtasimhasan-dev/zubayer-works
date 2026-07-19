"use client";
import { useRouter } from "next/navigation";
import Reveal from "./Reveal";
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

// 3:2 cropped at the source (keeping the bottom, where the logo sits) to match the
// vertical card's banner box exactly — the WebGL ripple then samples the same frame
// as the resting <img>, with no hover "jump".
const BG_IMG = { widths: [420, 560, 800], sizes: "(max-width:820px) 100vw, 33vw", ratio: 1.5, crop: "bottom" as const };

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
  // The one-liner may live in either "Short text" or "Tagline"; show whichever
  // was filled. Guard the description against whitespace-only values ("\n").
  const sub = v.shortText || v.tagline;
  const desc = v.description?.trim();
  return (
    <div
      className="venture-card vc-photo"
      role="link"
      tabIndex={0}
      aria-label={v.name}
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
        {sub && <p className="vc-short">{sub}</p>}
        {desc && <p className="vc-desc">{desc}</p>}
        <div className="vc-controls">
          <LinkPills v={v} variant="photo" />
          <span className="vc-learn" aria-hidden>Learn more <span className="vc-learn-arrow">&#8594;</span></span>
        </div>
      </div>
    </div>
  );
}

// LOGO card (ventures with no background photo). A solid card — black or white
// per `cardTheme` — text on the LEFT, the venture LOGO on the RIGHT, in Poppins.
// The logo RIPPLES on hover with the SAME MotionHover image effect as the Jadughor
// photo card (delivered square so cover doesn't crop, holdBase + activateOnHover so
// it only holds a WebGL context while hovered). Navigation is a click on the card
// itself (like the photo card) so the ripple layer receives the hover.
function PlainCard({ v }: { v: any }) {
  const router = useRouter();
  const light = v.cardTheme === "light";
  const theme = light ? "vl-light" : "vl-dark";
  const sub = v.shortText || v.tagline;
  const desc = v.description?.trim();
  const href = `/ventures/${v.slug || v.id}`;
  // Deliver the logo at its NATURAL aspect (no crop) and size the box to that same
  // aspect, so cover fills it exactly — nothing clips, and the resting frame matches
  // the WebGL ripple (no hover jump).
  const logoSrc = sanityImage(v.logo, { widths: [300, 400], sizes: "160px" }).src || "";
  const logoAspect = v.logoAspect || 1;
  return (
    <div
      className={`venture-card vl-card ${theme}`}
      role="link"
      tabIndex={0}
      aria-label={v.name}
      onClick={() => router.push(href)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(href); } }}
    >
      <div className="vl-box">
        {v.logo?.asset && logoSrc && (
          <div className="vl-logo" style={{ aspectRatio: logoAspect }}>
            <MotionHover type="image" src={logoSrc} activateOnHover amplitude={0.05} base={0.55} ambient={0.35} style={{ position: "absolute", inset: 0 }} />
          </div>
        )}
        <div className="vl-text">
          {v.kicker && <span className="vl-kicker">{v.kicker}</span>}
          <h3 className="vl-name">{v.name}</h3>
          {sub && <p className="vl-short">{sub}</p>}
          {desc && <p className="vl-desc">{desc}</p>}
          {(v.websiteUrl || v.youtubeUrl) && (
            <div className="venture-links vl-links">
              <LinkPills v={v} variant="plain" />
            </div>
          )}
          <span className="vl-more">
            <span className="vm-text">Learn more</span>
            <span className="vm-arrow" aria-hidden>&#8594;</span>
          </span>
        </div>
      </div>
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
