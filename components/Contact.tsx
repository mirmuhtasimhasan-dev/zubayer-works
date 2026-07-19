import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";
export default function Contact() {
  return (
    <>
      <section className="section" id="contact">
        <Reveal><p className="eyebrow">Contact</p></Reveal>
        <Reveal>
          <p className="contact-text">Ideas become meaningful when they&rsquo;re pursued with intent. If you have one worth pursuing, I&rsquo;d be interested to hear it.</p>
          <Link className="contact-email" href="/book">Discuss your project</Link>
        </Reveal>
      </section>
      {/* Rule on top, copyright left, the build credit right. */}
      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} Zubayer Ahmed</span>
        <span className="footer-credit">Made By Agent Wise X</span>
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
