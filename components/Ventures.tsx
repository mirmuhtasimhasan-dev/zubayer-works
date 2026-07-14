import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
import { sanityImage } from "@/sanity/lib/image";

const KICKER = "Thoughts in motion";

export default function Ventures({ ventures }: { ventures: any[] }) {
  if (!ventures?.length) return null;
  return (
    <section className="section" id="ventures">
      <div className="ven-head">
        <Reveal><p className="eyebrow">{KICKER}</p></Reveal>
        <Reveal><h2 className="ven-title">The Ventures</h2></Reveal>
      </div>
      <div className="ventures-grid">
        {ventures.map((v) => (
          <Reveal key={v.id} className="venture-cell">
            <Link href={`/ventures/${v.slug || v.id}`} className="venture-card">
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
                <span className="venture-more">
                  <span className="vm-text">Learn more</span>
                  <span className="vm-arrow" aria-hidden>&#8594;</span>
                </span>
              </LiquidHover>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
