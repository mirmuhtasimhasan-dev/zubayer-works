import Link from "next/link";
import Reveal from "./Reveal";

export default function Writing({ posts }: { posts: any[] }) {
  if (!posts?.length) return null;
  return (
    <section className="section" id="writing">
      <Reveal><p className="eyebrow">A Shoebox Under the Bed</p></Reveal>
      {posts.map((p) => (
        <Reveal key={p.id} className="writing-item">
          <Link href={`/writing/${p.slug}`}>
            <span className="writing-cat">{p.category}</span>
            <span className="writing-t">{p.title}</span>
          </Link>
        </Reveal>
      ))}
    </section>
  );
}
