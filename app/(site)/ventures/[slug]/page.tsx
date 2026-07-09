import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Nav from "@/components/Nav";
import { sanityImage } from "@/sanity/lib/image";
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

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVenture(slug);
  if (!v) return notFound();

  return (
    <main>
      <Nav />
      <article className="post venture-detail">
        <Link href="/#ventures" className="post-back">← The Ventures</Link>
        {v.logo && (
          <span className="venture-detail-logo">
            <img {...sanityImage(v.logo, { widths: [160, 320], sizes: "80px" })} alt={v.name} />
          </span>
        )}
        <h1 className="venture-detail-title">{v.name}</h1>
        {v.tagline && <p className="venture-detail-tag">{v.tagline}</p>}
        <div className="post-body">
          {v.body ? <PortableText value={v.body} /> : v.description ? <p>{v.description}</p> : null}
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
