import Link from "next/link";
import Reveal from "./Reveal";

export default function Work({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className="section" id="work">
      <Reveal><p className="eyebrow">The Eye</p></Reveal>
      <div className="work-grid">
        {items.map((it) => (
          <Reveal key={it.id} className={`work-item ${it.format === "wide" ? "wide" : ""} ${it.type === "video" ? "is-video" : ""}`}>
            <Link href={`/work/${it.slug}`} className="work-link">
              <div className="work-media">
                <img src={it.cover} alt={it.title} loading="lazy" />
                {it.type === "video" && <span className="work-play" />}
              </div>
              <div className="work-meta">
                <span className="work-title">{it.title}</span>
                <span className="work-label">{it.category}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
