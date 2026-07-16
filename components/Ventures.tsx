import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
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

export default function Ventures({ ventures }: { ventures: any[] }) {
  if (!ventures?.length) return null;
  return (
    <section className="section" id="ventures">
      <div className="ven-head">
        <Reveal><p className="eyebrow">{KICKER}</p></Reveal>
        <Reveal><h2 className="ven-title">{TITLE}</h2></Reveal>
      </div>
      <div className="ventures-grid">
        {ventures.map((v) => (
          <Reveal key={v.id} className="venture-cell">
            {/* Not an <a> wrapper: the icon links below must be their own anchors,
                so the card uses a stretched-link overlay for the page navigation. */}
            <div className="venture-card">
              {/* Whole-box liquid ripple on hover, same as the service cards. */}
              <LiquidHover className="venture-card-liquid" contentClassName="venture-box">
                {/* The logo lives on the venture's own page now, shown large. */}
                <div className="venture-head">
                  {/* Studio-managed (Ventures -> "Small line above the name"). */}
                  {v.kicker && <span className="venture-card-kicker">{v.kicker}</span>}
                  <h3 className="venture-card-name">{v.name}</h3>
                </div>
                {v.tagline && <p className="venture-card-tag">{v.tagline}</p>}
                {v.description && <p className="venture-card-desc">{v.description}</p>}

                {/* Link icons under the description (website / YouTube). These sit
                    above the stretched link so they stay independently clickable. */}
                {(v.websiteUrl || v.youtubeUrl) && (
                  <div className="venture-links">
                    {v.websiteUrl && (
                      <a
                        className="venture-ext"
                        href={v.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${v.name} website`}
                      >
                        <GlobeIcon />
                        <span className="venture-ext-label">{linkLabel(v.websiteUrl)}</span>
                      </a>
                    )}
                    {v.youtubeUrl && (
                      <a
                        className="venture-ext"
                        href={v.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${v.name} on YouTube`}
                      >
                        <YouTubeIcon />
                        <span className="venture-ext-label">{linkLabel(v.youtubeUrl)}</span>
                      </a>
                    )}
                  </div>
                )}

                <span className="venture-more">
                  <span className="vm-text">Learn more</span>
                  <span className="vm-arrow" aria-hidden>&#8594;</span>
                </span>

                {/* Stretched link: whole card opens the venture page, as an overlay
                    beneath the icon links above. */}
                <Link href={`/ventures/${v.slug || v.id}`} className="venture-stretch" aria-label={v.name} />
              </LiquidHover>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
