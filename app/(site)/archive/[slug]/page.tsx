import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import AlbumGallery from "@/components/AlbumGallery";
import { getAlbum, getAlbumSlugs } from "@/sanity/lib/queries";

export const revalidate = 30;

export async function generateStaticParams() {
  const slugs: string[] = await getAlbumSlugs();
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  return { title: album ? `${album.title} — The Archive` : "The Archive" };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return notFound();

  return (
    <main>
      <Nav />
      <article className="album">
        <div className="album-inner">
          <Link href="/#gallery" className="post-back">← The Archive</Link>
          <h1 className="album-title">{album.title}</h1>
          {album.place && <p className="album-place">{album.place}</p>}
          <AlbumGallery photos={album.photos || []} albumTitle={album.title} albumDescription={album.description} />
        </div>
      </article>
    </main>
  );
}
