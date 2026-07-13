import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import LiquidHover from "@/components/LiquidHover";
import { SERVICES, type Service } from "@/components/servicesData";
import { getEngagements } from "@/sanity/lib/queries";

export const revalidate = 30;

// Studio-managed, with the built-in list as a fallback until any exist.
async function loadEngagements(): Promise<Service[]> {
  const docs = await getEngagements();
  const list: Service[] = (docs || [])
    .filter((d: any) => d?.title && d?.slug)
    .map((d: any) => ({
      slug: d.slug,
      title: d.title,
      blurb: d.blurb || "",
      description: Array.isArray(d.description) ? d.description.filter(Boolean) : [],
      cta: d.cta || "",
      icon: d.icon,
    }));
  return list.length ? list : SERVICES;
}

export async function generateStaticParams() {
  const list = await loadEngagements();
  return list.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const list = await loadEngagements();
  const service = list.find((s) => s.slug === slug);
  return { title: service ? `${service.title} — Zubayer Ahmed` : "Engagements" };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await loadEngagements();
  const idx = list.findIndex((s) => s.slug === slug);
  if (idx < 0) return notFound();
  const service = list[idx];
  const [lead, ...rest] = service.description;

  return (
    <main>
      <Nav />
      <article className="service-detail">
        <div className="service-detail-inner">
          {/* Left rail: back + a numbered index of every engagement (current active) */}
          <aside className="service-rail">
            <Link href="/#services" className="post-back">← Engagements</Link>
            <ol className="service-rail-list">
              {list.map((s, i) => (
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
            <p className="service-kicker">Engagement · {String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</p>
            <h1 className="service-title">{service.title}</h1>

            {lead && <p className="service-lead">{lead}</p>}
            {rest.length > 0 && (
              <div className="service-body">
                {rest.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {service.cta && (
              <div className="service-cta">
                {/* The WHOLE box ripples like liquid on hover; the link stays live. */}
                <LiquidHover contentClassName="service-cta-box" strength={0.03} ambient={0.4}>
                  <p className="service-cta-text">{service.cta}</p>
                  <Link className="service-cta-email" href="/book">Book a session</Link>
                </LiquidHover>
              </div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
