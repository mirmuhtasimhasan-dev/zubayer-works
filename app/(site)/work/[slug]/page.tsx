import { notFound } from "next/navigation";
import { getWorkBySlug, getAllWorkSlugs } from "@/sanity/lib/queries";
import WorkDetail from "@/components/WorkDetail";

export const revalidate = 30;

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return (slugs || []).map((s: any) => ({ slug: s.slug }));
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getWorkBySlug(slug);
  if (!project) return notFound();
  return <WorkDetail project={project} />;
}
