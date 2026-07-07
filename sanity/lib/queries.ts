import { client } from "./client";

export async function getSettings() {
  return client.fetch(`*[_type == "siteSettings"][0]{
    locationLabel, headline, subText, aboutTitle, aboutIntro, aboutBody,
    "portrait": portrait.asset->url,
    disciplineTable, email, footerLine
  }`);
}

export async function getWork() {
  return client.fetch(`*[_type == "workItem"] | order(order asc){
    "id": _id, "slug": slug.current, type, title, category, format,
    "cover": cover.asset->url, description, videoEmbed,
    "images": images[].asset->url
  }`);
}

export async function getWorkBySlug(slug: string) {
  return client.fetch(`*[_type == "workItem" && slug.current == $slug][0]{
    "id": _id, "slug": slug.current, type, title, category, format,
    "cover": cover.asset->url, description, videoEmbed,
    "images": images[].asset->url
  }`, { slug });
}

export async function getAllWorkSlugs() {
  return client.fetch(`*[_type == "workItem" && defined(slug.current)]{"slug": slug.current}`);
}

export async function getGallery() {
  return client.fetch(`*[_type == "galleryImage"] | order(order asc){
    "id": _id, caption, "src": image.asset->url
  }`);
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
