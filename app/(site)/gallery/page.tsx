import type { Metadata } from "next";
import Nav from "@/components/Nav";
import GalleryTabs from "@/components/GalleryTabs";
import { getGalleryVideos, getGallery, getArchiveSettings } from "@/sanity/lib/queries";

export const revalidate = 30;

export const metadata: Metadata = { title: "Gallery — Zubayer Ahmed" };

export default async function GalleryPage() {
  const [videos, albums, archive] = await Promise.all([getGalleryVideos(), getGallery(), getArchiveSettings()]);

  return (
    <main>
      <Nav />
      {/* Videography (YouTube/Vimeo links → thumbnails) | Still Photos (archive albums) */}
      <GalleryTabs videos={videos} albums={albums} behanceUrl={archive?.behanceUrl} />
    </main>
  );
}
