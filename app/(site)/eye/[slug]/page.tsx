import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CategoryWorks from "@/components/CategoryWorks";
import { getCategoryBySlug, getCategorySlugs } from "@/sanity/lib/queries";

export const revalidate = 30;

export async function generateStaticParams() {
  const slugs: string[] = await getCategorySlugs();
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat ? `${cat.name} — The Eye` : "The Eye" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return notFound();

  return (
    <main>
      <Nav />
      <article className="eye-cat">
        <Link href="/#work" className="post-back">← The Eye</Link>
        <h1 className="eye-cat-title">{cat.name}</h1>
        <CategoryWorks works={cat.works || []} group={cat.group} />
      </article>
    </main>
  );
}
