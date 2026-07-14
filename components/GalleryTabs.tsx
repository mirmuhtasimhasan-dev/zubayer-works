"use client";
import { useEffect, useState } from "react";
import { imgProxy } from "@/lib/imgProxy";
import Link from "next/link";
import MotionHover from "./MotionHover";
import BehanceBadge from "./BehanceBadge";
import { sanityImage } from "@/sanity/lib/image";

// Normalize a YouTube/Vimeo URL to an embeddable one.
function embedUrl(url?: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="14" height="10" rx="1.5" />
      <path d="M16 10l5-3v10l-5-3z" />
    </svg>
  );
}

// Videos stack down the page grouped by category, each group under its own
// heading (category order first, then the video's own order — both from the
// Studio). Anything without a category falls into one unlabelled block at the end,
// so an unsorted library still looks like the old flat grid.
function groupByCategory(videos: any[]) {
  const groups = new Map<string, { id: string; name: string; order: number; videos: any[] }>();
  for (const v of videos) {
    const id = v.categoryId || "__none";
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: v.categoryId ? v.categoryName || "" : "",
        order: v.categoryId ? (typeof v.categoryOrder === "number" ? v.categoryOrder : 9998) : 9999,
        videos: [],
      });
    }
    groups.get(id)!.videos.push(v);
  }
  return [...groups.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

const THUMB = { widths: [400, 600, 800, 1000], sizes: "(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" };
const ALBUM_IMG = { widths: [400, 600, 800], sizes: "(max-width:600px) 48vw, (max-width:1000px) 32vw, 24vw" };

export default function GalleryTabs({ videos, albums, behanceUrl }: { videos: any[]; albums: any[]; behanceUrl?: string }) {
  const [tab, setTab] = useState<"video" | "photos">("video");
  const [lb, setLb] = useState<string | null>(null); // embed url of the playing video

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLb(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb]);

  return (
    <section className="section section-page" id="gallery">
      <div className="eye-toggle" role="tablist" aria-label="Gallery">
        <button role="tab" aria-selected={tab === "video"} className={`eye-pill ${tab === "video" ? "active" : ""}`} onClick={() => setTab("video")}>
          Videography
        </button>
        <button role="tab" aria-selected={tab === "photos"} className={`eye-pill ${tab === "photos" ? "active" : ""}`} onClick={() => setTab("photos")}>
          Still Photos
        </button>
      </div>

      {tab === "video" ? (
        videos?.length ? (
          // One block per category, stacked down the page, each under its heading.
          <div className="eye-groups">
            {groupByCategory(videos).map((g) => (
              <section className="eye-group" key={g.id}>
                {g.name && <h3 className="eye-group-title">{g.name}</h3>}
                <div className="eye-grid">
                  {g.videos.map((v: any) => {
                    // Sanity images are CORS-ok; the YouTube thumb goes through the
                    // proxy so it can be a WebGL texture for the ripple.
                    const src = v.cover
                      ? sanityImage(v.cover, THUMB).src
                      : v.autoThumb
                      ? imgProxy(v.autoThumb)
                      : "";
                    return (
                      <button key={v.id} className="eye-work" onClick={() => setLb(embedUrl(v.videoUrl))}>
                        <div className="eye-work-media">
                          {src ? (
                            // Same ripple feel as the featured Eye tiles; holdBase +
                            // activateOnHover so many tiles never exhaust the WebGL
                            // contexts. No zoom/swell.
                            <MotionHover
                              type="image"
                              src={src}
                              holdBase
                              activateOnHover
                              style={{ position: "absolute", inset: 0 }}
                            />
                          ) : (
                            <span className="eye-tile-placeholder"><VideoIcon /></span>
                          )}
                          <span className="eye-work-play" aria-hidden />
                        </div>
                        {v.title && <span className="eye-work-title">{v.title}</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="eye-empty">No videos yet — add YouTube/Vimeo links in the Studio.</p>
        )
      ) : albums?.length ? (
        <>
        <div className="gallery-albums">
          {albums.map((a) => (
            <Link key={a.id} href={`/archive/${a.slug || a.id}`} className="gallery-album">
              <div className="gallery-album-media">
                {a.image && <img {...sanityImage(a.image, ALBUM_IMG)} alt={a.title || ""} loading="lazy" />}
              </div>
              <span className="gallery-album-name">{a.title}</span>
              {(a.place || a.count) && (
                <span className="gallery-album-place">
                  {a.place}
                  {a.place && a.count ? " · " : ""}
                  {a.count ? `${a.count} photo${a.count === 1 ? "" : "s"}` : ""}
                </span>
              )}
            </Link>
          ))}
        </div>
          {/* Same rotating badge as The Archive — the full set lives on Behance.
              Here it is a smaller, right-aligned sign-off under the album grid. */}
          <div className="arch-foot arch-foot-end">
            <BehanceBadge href={behanceUrl || "https://www.behance.net/zubayerahmed23"} />
          </div>
        </>
      ) : (
        <p className="eye-empty">No albums yet.</p>
      )}

      {lb && (
        <div className="lightbox" onClick={() => setLb(null)}>
          <button className="lb-close" aria-label="Close" onClick={() => setLb(null)}>&#10005;</button>
          <div className="eye-videobox" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${lb}${lb.includes("?") ? "&" : "?"}autoplay=1`}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        </div>
      )}
    </section>
  );
}
