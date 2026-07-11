import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { sanityImage } from "@/sanity/lib/image";
import { getWorkCategories } from "@/sanity/lib/queries";

export const revalidate = 30;

export const metadata: Metadata = { title: "The Eye — Zubayer Ahmed" };

const CAT_IMG = { widths: [400, 600, 800], sizes: "(max-width:600px) 48vw, (max-width:1000px) 32vw, 24vw" };

export default async function EyeIndexPage() {
  const cats = ((await getWorkCategories()) || []).filter((c: any) => c?.group !== "Still Photos");

  return (
    <main>
      <Nav />
      <article className="eye-cat">
        <Link href="/#work" className="post-back">← Home</Link>
        <h1 className="eye-cat-title">The Eye</h1>
        {cats.length ? (
          <div className="gallery-albums">
            {cats.map((c: any) => {
              const count = c.works?.length ?? 0;
              return (
                <Link key={c.id} href={`/eye/${c.slug || c.id}`} className="gallery-album">
                  <div className="gallery-album-media">
                    {c.cover && <img {...sanityImage(c.cover, CAT_IMG)} alt={c.name} loading="lazy" />}
                  </div>
                  <span className="gallery-album-name">{c.name}</span>
                  <span className="gallery-album-place">{count} {count === 1 ? "work" : "works"}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="eye-empty">No categories yet.</p>
        )}
      </article>
    </main>
  );
}
