"use client";
/**
 * <WritingGrid> — the Substack posts as cards: image on top, words underneath,
 * three across. The first row shows; "Show more" drops the rest in beneath it.
 *
 * The posts are fetched on the SERVER and handed in as props — this component
 * only owns the show-more state. Every card is in the DOM from the start, so the
 * shoebox stagger and search engines both see them; the extra rows are simply
 * hidden until asked for.
 */
import { useState } from "react";
import type { SubstackPost } from "@/lib/substack";

/* ─────────────── Tunable ─────────────── */
const VISIBLE = 3; // cards shown before "Show more"
/* ────────────────────────────────────── */

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function WritingGrid({
  posts,
  startIndex = 0,
}: {
  posts: SubstackPost[];
  /** Where this block sits in the shoebox stagger. */
  startIndex?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, posts.length - VISIBLE);

  return (
    <>
      <div className={`wr-grid ${expanded ? "is-expanded" : ""}`}>
        {posts.map((p, i) => (
          <a
            key={p.id}
            className={`wr-card sbx-i ${i >= VISIBLE ? "wr-card-extra" : ""}`}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ["--i" as string]: startIndex + Math.min(i, VISIBLE) }}
            // Hidden rows are out of the tab order until they are shown.
            tabIndex={i >= VISIBLE && !expanded ? -1 : undefined}
            aria-hidden={i >= VISIBLE && !expanded ? true : undefined}
          >
            <span className="wr-card-media">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" loading="lazy" />
              ) : (
                <span className="wr-card-ph" aria-hidden />
              )}
            </span>
            <span className="wr-card-body">
              <span className="wr-card-t">{p.title}</span>
              {p.excerpt && <span className="wr-card-ex">{p.excerpt}</span>}
              {p.date && <span className="wr-card-date">{fmtDate(p.date)}</span>}
            </span>
          </a>
        ))}
      </div>

      {hidden > 0 && !expanded && (
        <div className="wr-more sbx-i" style={{ ["--i" as string]: startIndex + VISIBLE }}>
          <button type="button" className="wr-more-btn" onClick={() => setExpanded(true)}>
            Show more <span aria-hidden>&#8595;</span>
          </button>
        </div>
      )}
    </>
  );
}
