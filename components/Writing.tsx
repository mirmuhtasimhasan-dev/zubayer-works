import Reveal from "./Reveal";
import QuoteRotator from "./QuoteRotator";
import MagneticButton from "./MagneticButton";
import { SUBSTACK_URL, type SubstackPost } from "@/lib/substack";

// Change the button's wording here.
const CTA_LABEL = "Read everything on Substack";

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Writing({
  posts,
  quotes,
  substackUrl,
}: {
  posts: SubstackPost[];
  quotes?: string[];
  /** Studio-managed (Writing Settings); falls back to the feed's own URL. */
  substackUrl?: string;
}) {
  if (!posts?.length && !quotes?.length) return null;
  const href = substackUrl || SUBSTACK_URL;
  return (
    <section className="section" id="writing">
      {quotes?.length ? <QuoteRotator quotes={quotes} /> : null}
      <Reveal><p className="eyebrow">A Shoebox Under the Bed</p></Reveal>
      {posts?.length ? (
      <>
      <div className="writing-list">
        {posts.map((p) => (
          <Reveal key={p.id} className="writing-item">
            <a href={p.link} target="_blank" rel="noopener noreferrer">
              {p.image ? (
                <span className="writing-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" loading="lazy" />
                </span>
              ) : (
                <span className="writing-thumb writing-thumb-ph" aria-hidden />
              )}
              <span className="writing-main">
                <span className="writing-t">{p.title}</span>
                {p.excerpt && <span className="writing-ex">{p.excerpt}</span>}
              </span>
              {p.date && <span className="writing-date">{fmtDate(p.date)}</span>}
            </a>
          </Reveal>
        ))}
      </div>
      {/* Closing CTA: an ink pill that leans toward the cursor as it approaches. */}
      <div className="writing-foot">
        <Reveal>
          <MagneticButton href={href} label={CTA_LABEL} />
        </Reveal>
      </div>
      </>
      ) : null}
    </section>
  );
}
