import Link from "next/link";
import Reveal from "./Reveal";
import { SERVICES } from "./servicesData";

export default function Services() {
  return (
    <section className="section" id="services">
      <Reveal><p className="eyebrow">Services</p></Reveal>
      <div className="services-grid">
        {SERVICES.map((s) => (
          <Reveal key={s.slug} className="service-card-cell">
            <Link href={`/services/${s.slug}`} className="service-card">
              <span className="service-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <span className="service-more">Learn more →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
