import { client } from "./client";
import { getVideoThumbnail } from "./video";

export async function getSettings() {
  return client.fetch(`*[_type == "siteSettings"][0]{
    locationLabel, headline, subText, aboutTitle, aboutIntro, aboutBody,
    "portrait": portrait.asset->url,
    disciplineTable, email, footerLine
  }`);
}

export async function getAbout() {
  return client.fetch(`*[_type == "aboutPage"][0]{
    eyebrow, title, "portrait": portrait.asset->url, body
  }`);
}

// For a video work with no manual cover, derive the thumbnail from its link.
async function withAutoThumb(w: any) {
  if (w && !w.cover && w.videoEmbed) {
    w.autoThumb = await getVideoThumbnail(w.videoEmbed);
  }
  return w;
}

// The single featured work item, shown full-width at the top of The Eye.
export async function getFeaturedWork() {
  const featured = await client.fetch(`*[_type == "workItem" && featured == true] | order(order asc)[0]{
    "id": _id, title, kind, cover, image, videoEmbed, "videoFile": videoFile.asset->url,
    "categoryName": category->name, "categoryGroup": category->group
  }`);
  return withAutoThumb(featured);
}

// Every category (grouped in code) with its works, for the toggle → slider → drill-down.
export async function getWorkCategories() {
  const cats = await client.fetch(`*[_type == "category"] | order(order asc, name asc){
    "id": _id, name, group, cover,
    "works": *[_type == "workItem" && references(^._id)] | order(order asc, _createdAt asc){
      "id": _id, title, kind, cover, image, videoEmbed, "videoFile": videoFile.asset->url
    }
  }`);
  await Promise.all((cats || []).flatMap((c: any) => (c.works || []).map(withAutoThumb)));
  return cats;
}

export async function getGallery() {
  return client.fetch(`*[_type == "galleryImage"] | order(order asc){
    "id": _id, "title": coalesce(title, caption), place, image
  }`);
}

export async function getArchiveSettings() {
  return client.fetch(`*[_type == "archiveSettings"][0]{ behanceUrl }`);
}

export async function getVentures() {
  return client.fetch(`*[_type == "venture"] | order(order asc){
    "id": _id, name, tagline, description, inquiryEmail
  }`);
}

export async function getWriting() {
  return client.fetch(`*[_type == "writingPiece"] | order(date desc){
    "id": _id, "slug": slug.current, title, category, date, excerpt,
    "cover": cover.asset->url, body
  }`);
}

export async function getWritingBySlug(slug: string) {
  return client.fetch(`*[_type == "writingPiece" && slug.current == $slug][0]{
    "id": _id, "slug": slug.current, title, category, date, excerpt,
    "cover": cover.asset->url, body
  }`, { slug });
}

export async function getAllWritingSlugs() {
  return client.fetch(`*[_type == "writingPiece" && defined(slug.current)]{"slug": slug.current}`);
}
