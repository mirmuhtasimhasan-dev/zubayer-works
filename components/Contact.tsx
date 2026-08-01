import Link from "next/link";
import Reveal from "./Reveal";
import LiquidHover from "./LiquidHover";

// The three ways to reach out — icons for the circular links on the right.
const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/zubayerscape?igsh=amF5aHpqcm1vZTJj&utm_source=qr",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ahmedzubayer",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 10.5V17" />
        <circle cx="7" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
        <path d="M11 17v-6.5" />
        <path d="M11 13.6a2.5 2.5 0 0 1 5 0V17" />
      </svg>
    ),
  },
  {
    // Gmail compose in a new tab — opens reliably even on machines with no default
    // desktop mail app (where a plain mailto: link does nothing).
    label: "Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=zubayerahmd172@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.6 6.6 8.4 6 8.4-6" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <>
      <section className="section" id="contact">
        <div className="contact-inner">
          <div className="contact-main">
            <Reveal><p className="eyebrow">Contact</p></Reveal>
            <Reveal>
              <p className="contact-text">Ideas become meaningful when they&rsquo;re pursued with intent. If you have one worth pursuing, I&rsquo;d be interested to hear it.</p>
              <Link className="contact-email" href="/book">Book a session</Link>
            </Reveal>
          </div>
          <Reveal className="contact-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                className="contact-social"
                href={s.href}
                aria-label={s.label}
                {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {s.icon}
              </a>
            ))}
          </Reveal>
        </div>
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
