import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { sanityImage } from "@/sanity/lib/image";
import { getAffiliatesPage } from "@/sanity/lib/queries";

export const revalidate = 30;

export const metadata: Metadata = { title: "Affiliates — Zubayer Ahmed" };

// Academic first, then Professional; array order is preserved within each group.
const CATEGORIES: { key: string; label: string }[] = [
  { key: "academic", label: "Academic" },
  { key: "professional", label: "Professional" },
];

const LOGO_IMG = { widths: [52, 88, 104], sizes: "52px" };

// The lead may wrap a clause in *asterisks* to render it as a Cormorant italic
// serif accent (e.g. "...*where the thinking was formed*...").
function renderLead(lead?: string) {
  if (!lead) return null;
  return lead.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="aff-lead-accent">{part}</em>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default async function AffiliatesPage() {
  const page = await getAffiliatesPage();
  const all: any[] = page?.affiliations || [];

  return (
    <main>
      <Nav />
      <article className="aff">
        <header className="aff-head">
          <p className="aff-eyebrow">
            <span>Engagements</span>
            <span className="aff-mid" aria-hidden>&middot;</span>
            <span>{page?.eyebrow || "Affiliates"}</span>
          </p>
          <h1 className="aff-title">{page?.title || "Affiliations"}</h1>
          {page?.lead && <p className="aff-lead">{renderLead(page.lead)}</p>}
        </header>

        {CATEGORIES.map((cat) => {
          const rows = all.filter((a) => a?.category === cat.key);
          if (!rows.length) return null;
          return (
            <section className="aff-group" key={cat.key}>
              <h2 className="aff-section-label">{cat.label}</h2>
              <ul className="aff-list">
                {rows.map((a, i) => {
                  const inner = (
                    <>
                      <span className="aff-logo">
                        {a.logo?.asset && <img {...sanityImage(a.logo, LOGO_IMG)} alt="" loading="lazy" />}
                      </span>
                      <span className="aff-text">
                        {a.role && <span className="aff-role">{a.role}</span>}
                        <span className="aff-name">{a.institution}</span>
                      </span>
                    </>
                  );
                  const key = a._key || `${cat.key}-${i}`;
                  return (
                    <li className="aff-item" key={key}>
                      {a.url ? (
                        <a
                          className="aff-row"
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${a.institution}${a.role ? " — " + a.role : ""}`}
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="aff-row">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </article>
    </main>
  );
}
