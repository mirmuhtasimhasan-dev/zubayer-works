import QuoteRotator from "./QuoteRotator";
import ShoeboxReveal from "./ShoeboxReveal";
import WritingGrid from "./WritingGrid";
import { SUBSTACK_URL, type SubstackPost } from "@/lib/substack";

// Section head, same rhythm as The Eye and The Ventures.
const KICKER = "Scrappy Scribbles";
const TITLE = "A Shoebox Under the Bed";
const INTRO =
  "Not a blog. Just things written down because they kept circling. Discovered, not displayed.";

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
      {/* The rotating quote stays outside the cover — it is not part of the box. */}
      {quotes?.length ? <QuoteRotator quotes={quotes} /> : null}

      {/* Everything below starts behind a closed kraft cover. The content is still
          server-rendered and always in the DOM; ShoeboxReveal only adds the cover
          and the open state. */}
      <ShoeboxReveal kicker={KICKER} title={TITLE}>
        <div className="wr-head">
          {/* The kicker doubles as the link out to the Substack, the way The Eye's
              kicker opens the YouTube channel. */}
          <a
            className="eyebrow eye-channel wr-channel sbx-i"
            style={{ ["--i" as string]: 0 }}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {KICKER} <span className="wr-channel-arrow" aria-hidden>&#8599;</span>
          </a>
          <h2 className="wr-title sbx-i" tabIndex={-1} style={{ ["--i" as string]: 1 }}>{TITLE}</h2>
          <p className="wr-intro sbx-i" style={{ ["--i" as string]: 2 }}>{INTRO}</p>
        </div>
        {posts?.length ? (
          <>
            {/* Three across: image on top, words underneath. "Show more" drops the
                rest in below. Fetched on the server; the grid only owns that state. */}
            <WritingGrid posts={posts} startIndex={3} />
          </>
        ) : null}
      </ShoeboxReveal>
    </section>
  );
}
