import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SERVICES, SERVICES_EMAIL } from "@/components/servicesData";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  return { title: service ? `${service.title} — Zubayer Ahmed` : "Services" };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = SERVICES.findIndex((s) => s.slug === slug);
  if (idx < 0) return notFound();
  const service = SERVICES[idx];
  const [lead, ...rest] = service.description;

  return (
    <main>
      <Nav />
      <article className="service-detail">
        <div className="service-detail-inner">
          {/* Left rail: back + a numbered index of every service (current active) */}
          <aside className="service-rail">
            <Link href="/#services" className="post-back">← Services</Link>
            <ol className="service-rail-list">
              {SERVICES.map((s, i) => (
                <li key={s.slug} className={s.slug === slug ? "is-active" : ""}>
                  <Link href={`/services/${s.slug}`}>
                    <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="name">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>

          <div className="service-main">
            <p className="service-kicker">Service · {String(idx + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}</p>
            <h1 className="service-title">{service.title}</h1>

            {lead && <p className="service-lead">{lead}</p>}
            {rest.length > 0 && (
              <div className="service-body">
                {rest.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            <div className="service-cta">
              <p className="service-cta-text">{service.cta}</p>
              <a className="service-cta-email" href={`mailto:${SERVICES_EMAIL}`}>{SERVICES_EMAIL}</a>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
