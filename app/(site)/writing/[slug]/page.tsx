import Link from "next/link";
import { notFound } from "next/navigation";
import { getWritingBySlug, getAllWritingSlugs } from "@/sanity/lib/queries";

export const revalidate = 30;

export async function generateStaticParams() {
  const slugs = await getAllWritingSlugs();
  return (slugs || []).map((s: any) => ({ slug: s.slug }));
}

export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) return notFound();
  return (
    <article className="post">
      <Link href="/#writing" className="post-back">← A Shoebox Under the Bed</Link>
      <p className="post-cat">{post.category}</p>
      <h1 className="post-title">{post.title}</h1>
      {post.date && (
        <p className="post-date">
          {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}
      {post.cover && <div className="post-cover"><img src={post.cover} alt={post.title} /></div>}
      <div className="post-body">
        {(post.body || []).map((para: string, i: number) => <p key={i}>{para}</p>)}
      </div>
    </article>
  );
}
