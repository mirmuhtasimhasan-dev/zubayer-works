import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
import { sanityImage } from "@/sanity/lib/image";

export default function Ventures({ ventures }: { ventures: any[] }) {
  if (!ventures?.length) return null;
  return (
    <section className="section" id="ventures">
      <Reveal><p className="eyebrow">The Ventures</p></Reveal>
      <div className="ventures-grid">
        {ventures.map((v) => (
          <Reveal key={v.id} className="venture-cell">
            <Link href={`/ventures/${v.slug || v.id}`} className="venture-card">
              {/* Whole-box liquid ripple on hover, same as the service cards. */}
              <LiquidHover className="venture-card-liquid" contentClassName="venture-box">
                <div className="venture-head">
                  <span className="venture-logo">
                    {v.logo ? (
                      <img {...sanityImage(v.logo, { widths: [120, 240], sizes: "56px" })} alt={v.name} />
                    ) : (
                      <span className="venture-logo-ph" aria-hidden>{v.name?.[0] ?? "•"}</span>
                    )}
                  </span>
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
