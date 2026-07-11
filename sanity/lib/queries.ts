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

// The featured work items, shown full-width at the top of The Eye. Mark as many
// as you like as "featured" in the Studio; they stack in order.
export async function getFeaturedWork() {
  const items = await client.fetch(`*[_type == "workItem" && featured == true] | order(order asc, _createdAt asc){
    "id": _id, title, kind, cover, image, videoEmbed, "videoFile": videoFile.asset->url,
    "categoryName": category->name, "categoryGroup": category->group,
    "categorySlug": category->slug.current, "categoryId": category->_id
  }`);
  await Promise.all((items || []).map(withAutoThumb));
  return items || [];
}

// One category with all its works, for its own page (/eye/<slug>). Falls back to _id.
export async function getCategoryBySlug(slug: string) {
  const cat = await client.fetch(
    `*[_type == "category" && (slug.current == $slug || _id == $slug)][0]{
      "id": _id, name, group, "slug": slug.current,
      "works": *[_type == "workItem" && references(^._id)] | order(order asc, _createdAt asc){
        "id": _id, title, kind, cover, image, videoEmbed, "videoFile": videoFile.asset->url
      }
    }`,
    { slug }
  );
  if (cat?.works) await Promise.all(cat.works.map(withAutoThumb));
  return cat;
}

export async function getCategorySlugs() {
  return client.fetch(`*[_type == "category" && defined(slug.current)].slug.current`);
}

// Every category (grouped in code) with its works, for the toggle → slider → drill-down.
export async function getWorkCategories() {
  const cats = await client.fetch(`*[_type == "category"] | order(order asc, name asc){
    "id": _id, name, group, cover, "slug": slug.current,
    "works": *[_type == "workItem" && references(^._id)] | order(order asc, _createdAt asc){
      "id": _id, title, kind, cover, image, videoEmbed, "videoFile": videoFile.asset->url
    }
  }`);
  await Promise.all((cats || []).flatMap((c: any) => (c.works || []).map(withAutoThumb)));
  return cats;
}

// Archive albums (cover row on the home page). Any album with a name + cover
// shows (opens by slug, or by _id if the slug wasn't generated yet); truly empty
// drafts are skipped.
export async function getGallery() {
  return client.fetch(`*[_type == "galleryImage" && defined(title) && defined(image)] | order(order asc){
    "id": _id, title, place, image, "slug": slug.current, "count": count(photos)
  }`);
}

// One album with all its photos, by slug (falls back to _id for legacy items).
export async function getAlbum(slug: string) {
  return client.fetch(
    `*[_type == "galleryImage" && (slug.current == $slug || _id == $slug)][0]{
      "id": _id, title, place, "slug": slug.current,
      "photos": photos[]{ ..., "ar": asset->metadata.dimensions.aspectRatio }
    }`,
    { slug }
  );
}

// Slugs for static generation of the album pages.
export async function getAlbumSlugs() {
  return client.fetch(`*[_type == "galleryImage" && defined(slug.current)].slug.current`);
}

export async function getArchiveSettings() {
  return client.fetch(`*[_type == "archiveSettings"][0]{ behanceUrl }`);
}

// Gallery page → "Videography" tab: video links whose thumbnails come from the URL.
export async function getGalleryVideos() {
  const vids = await client.fetch(`*[_type == "galleryVideo"] | order(order asc){
    "id": _id, title, videoUrl, cover
  }`);
  await Promise.all(
    (vids || []).map(async (v: any) => {
      if (!v.cover && v.videoUrl) v.autoThumb = await getVideoThumbnail(v.videoUrl);
    })
  );
  return vids;
}

export async function getVentures() {
  return client.fetch(`*[_type == "venture"] | order(order asc){
    "id": _id, name, tagline, description, "slug": slug.current, logo
  }`);
}

// One venture with its full page content, by slug (falls back to _id).
export async function getVenture(slug: string) {
  return client.fetch(
    `*[_type == "venture" && (slug.current == $slug || _id == $slug)][0]{
      "id": _id, name, tagline, description, "slug": slug.current, logo, body, inquiryEmail
    }`,
    { slug }
  );
}

export async function getVentureSlugs() {
  return client.fetch(`*[_type == "venture" && defined(slug.current)].slug.current`);
}

// Rotating pull-quotes above the Writing section (returns an array of strings).
export async function getQuotes() {
  return client.fetch(`*[_type == "quote" && defined(text)] | order(order asc, _createdAt asc).text`);
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
