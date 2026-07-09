import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
export default function Contact({ settings }: { settings: any }) {
  const email = settings?.email || "hello@zubayer.works";
  return (
    <>
      <section className="section" id="contact">
        <Reveal><p className="eyebrow">Contact</p></Reveal>
        <Reveal>
          <p className="contact-text">If something here made you think, write to me properly.</p>
          <a className="contact-email" href={`mailto:${email}`}>{email}</a>
        </Reveal>
      </section>
      <footer className="footer">
        <span>Zubayer Ahmed · {settings?.locationLabel || "Dhaka, Bangladesh"}</span>
        <span>{settings?.footerLine}</span>
      </footer>
      <div className="back-to-top-wrap">
        <a href="#top" className="back-to-top" aria-label="Back to top">
          {/* Arrow + line + vertical "TOP" ripple together as one liquid shape on
              hover. The snapshotted .btt-box has padding so nothing clips. */}
          <LiquidHover contentClassName="btt-box" strength={0.045} ambient={0.5}>
            <span className="btt-arrow" />
            <span className="btt-label">TOP</span>
          </LiquidHover>
        </a>
      </div>
    </>
  );
}
