import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Affiliates — Zubayer Ahmed",
};

// A standalone page reached from Engagements -> Affiliates in the nav. Static for
// now; wire it to the Studio (an "affiliate" doc type) once the partners are known.
export default function AffiliatesPage() {
  return (
    <main>
      <Nav />
      <article className="post about-page">
        <div className="about-page-head">
          <Link href="/#services" className="post-back">&#8592; Engagements</Link>
        </div>
        <p className="eyebrow">Engagements</p>
        <h1 className="about-title">Affiliates</h1>
        <div className="post-body">
          <p>
            The partners, collaborators, and platforms the studio works alongside.
            This page is a placeholder &mdash; share the affiliate list and it goes here.
          </p>
        </div>
      </article>
    </main>
  );
}
