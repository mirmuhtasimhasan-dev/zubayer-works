import Reveal from "./Reveal";
import QuoteRotator from "./QuoteRotator";
import { SUBSTACK_URL, type SubstackPost } from "@/lib/substack";

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Writing({ posts, quotes }: { posts: SubstackPost[]; quotes?: string[] }) {
  if (!posts?.length && !quotes?.length) return null;
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
      <div className="writing-foot">
        <a className="writing-more" href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
          Read more on Substack <span aria-hidden>&#8599;</span>
        </a>
      </div>
      </>
      ) : null}
    </section>
  );
}
