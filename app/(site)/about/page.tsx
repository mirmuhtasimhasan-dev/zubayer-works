import type { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import Nav from "@/components/Nav";
import { getAbout } from "@/sanity/lib/queries";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "About — Zubayer Ahmed",
};

export default async function AboutPage() {
  const about = await getAbout();
  const hasImage = Boolean(about?.portrait);

  const head = (
    <div className="about-page-head">
      <Link href="/" className="post-back">← Back home</Link>
    </div>
  );

  const body = (
    <>
      {about?.eyebrow && <p className="eyebrow">{about.eyebrow}</p>}
      <h1 className="about-title">{about?.title ?? "About"}</h1>
      <div className="post-body">
        {about?.body ? (
          <PortableText value={about.body} />
        ) : (
          <p>This page is managed in the CMS. Add the “About Page” content in the Studio.</p>
        )}
      </div>
    </>
  );

  return (
    <main>
      <Nav />
      {hasImage ? (
        <section className="section about-page">
          {/* Back home + About span across the top — above both the pic and the title. */}
          {head}
          <div className="about">
            <div className="about-portrait">
              <img src={about!.portrait} alt={about?.title ?? "About"} />
            </div>
            <div className="about-body">{body}</div>
          </div>
        </section>
      ) : (
        <article className="post about-page">
          {head}
          {body}
        </article>
      )}
    </main>
  );
}
