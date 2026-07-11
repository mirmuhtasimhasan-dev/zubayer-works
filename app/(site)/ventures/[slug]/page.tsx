import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Nav from "@/components/Nav";
import { sanityImage, urlFor } from "@/sanity/lib/image";
import { getVenture, getVentureSlugs } from "@/sanity/lib/queries";

export const revalidate = 30;

export async function generateStaticParams() {
  const slugs: string[] = await getVentureSlugs();
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVenture(slug);
  return { title: v ? `${v.name} — Ventures` : "Ventures" };
}

// Normalize a YouTube/Vimeo URL to an embeddable one.
function embedUrl(url?: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// Render images & video embeds inside the venture body.
const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure className="v-media">
        <img src={urlFor(value).width(1600).fit("max").auto("format").url()} alt={value?.caption || ""} loading="lazy" />
        {value?.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
    videoEmbed: ({ value }) => {
      const src = embedUrl(value?.url);
      if (!src) return null;
      return (
        <figure className="v-media">
          <div className="v-video">
            <iframe src={src} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen title={value?.caption || "Video"} />
          </div>
          {value?.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVenture(slug);
  if (!v) return notFound();

  return (
    <main>
      <Nav />
      <article className="venture-detail">
        <Link href="/#ventures" className="post-back">← The Ventures</Link>
        <header className="venture-detail-head">
          {v.logo && (
            <span className="venture-detail-logo">
              <img {...sanityImage(v.logo, { widths: [160, 320], sizes: "80px" })} alt={v.name} />
            </span>
          )}
          <h1 className="venture-detail-title">{v.name}</h1>
          {v.tagline && <p className="venture-detail-tag">{v.tagline}</p>}
        </header>

        <div className="post-body venture-detail-body">
          {v.body?.length ? (
            <PortableText value={v.body} components={components} />
          ) : v.description ? (
            <p>{v.description}</p>
          ) : null}
        </div>

        {v.inquiryEmail && (
          <a
            className="venture-detail-cta"
            href={`mailto:${v.inquiryEmail}?subject=${encodeURIComponent("Interested in " + v.name)}`}
          >
            Interested in this →
          </a>
        )}
      </article>
    </main>
  );
}
