import Reveal from "./Reveal";

const CARDS = [
  {
    t: "Documentary Filmmaking",
    d: "Long-form stories, shot and cut with intent.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="10" rx="1.5" />
        <path d="M16 10l5-3v10l-5-3z" />
      </svg>
    ),
  },
  {
    t: "Story-Based Advertising",
    d: "Brand films that make people feel before they buy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.4l6 3.6-6 3.6z" />
      </svg>
    ),
  },
  {
    t: "Brand Development & Consultancy",
    d: "Positioning, identity, and the strategy underneath.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.6 8.4l-2.3 4.9-4.9 2.3 2.3-4.9z" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section className="section" id="services">
      <Reveal><p className="eyebrow">Services</p></Reveal>
      <div className="services-grid">
        {CARDS.map((c) => (
          <Reveal key={c.t} className="service-card">
            <span className="service-icon">{c.icon}</span>
            <h3>{c.t}</h3>
            <p>{c.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
