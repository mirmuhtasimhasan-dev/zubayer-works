import Reveal from "./Reveal";
export default function About({ settings }: { settings: any }) {
  return (
    <section className="section about" id="about">
      <div className="about-portrait">{settings?.portrait && <img src={settings.portrait} alt="Zubayer Ahmed" />}</div>
      <div className="about-body">
        <Reveal><p className="eyebrow">The Founder</p></Reveal>
        <Reveal><h2 className="about-title">{settings?.aboutTitle}</h2></Reveal>
        <Reveal><p className="about-intro">{settings?.aboutIntro}</p></Reveal>
        <div className="about-text">
          {(settings?.aboutBody || []).map((p: string, i: number) => (<Reveal key={i} delay={i * 60}><p>{p}</p></Reveal>))}
        </div>
        <Reveal>
          <table className="discipline">
            <tbody>
              {(settings?.disciplineTable || []).map((r: any, i: number) => (
                <tr key={i}><td>{r.institution}</td><td>{r.credits}</td><td>{r.location}</td></tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
