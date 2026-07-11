import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
import InteractiveFish from "./InteractiveFish";
import { SERVICES } from "./servicesData";

export default function Services() {
  return (
    <section className="section" id="services">
      <Reveal><p className="eyebrow">Services</p></Reveal>
      <div className="services-grid">
        {SERVICES.map((s) => (
          <Reveal key={s.slug} className="service-card-cell">
            <Link href={`/services/${s.slug}`} className="service-card">
              {/* The WHOLE box — background, edges and content — ripples as one on
                  hover. The box visuals live on the snapshotted element (.service-box). */}
              <LiquidHover className="service-card-liquid" contentClassName="service-box">
                <span className="service-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
              </LiquidHover>
              {/* Ambient fish swims over the card + chases the cursor; sits above
                  the ripple layer so BOTH run together. pointer-events:none. */}
              <InteractiveFish />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
