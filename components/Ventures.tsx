import Reveal from "./Reveal";
export default function Ventures({ ventures }: { ventures: any[] }) {
  if (!ventures?.length) return null;
  return (
    <section className="section" id="ventures">
      <Reveal><p className="eyebrow">The Ventures</p></Reveal>
      {ventures.map((v) => (
        <Reveal key={v.id} className="venture-row">
          <div><h3 className="venture-name">{v.name}</h3><p className="venture-tagline">{v.tagline}</p></div>
          <div>
            <p className="venture-desc">{v.description}</p>
            <a className="venture-cta" href={`mailto:${v.inquiryEmail}?subject=${encodeURIComponent("Investment inquiry: " + v.name)}`}>Interested in this →</a>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
