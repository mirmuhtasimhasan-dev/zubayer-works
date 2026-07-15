import { defineType, defineField } from "sanity";

// Each Archive item is now an ALBUM: a cover on the home row that opens its own
// page (/archive/[slug]) showing all the photos inside.
export default defineType({
  name: "galleryImage",
  title: "The Archive (Album)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Album name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (page URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
      description: "Auto-filled from the name — the album opens at /archive/<slug>.",
    }),
    defineField({ name: "place", title: "Place / date", type: "string", description: 'e.g. "Rangamati" or a date' }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Shown beside a photo in the lightbox when that photo has no caption of its own.",
    }),
    defineField({
      name: "image",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
      description: "Shown on the archive card that opens this album.",
    }),
    defineField({
      name: "photos",
      title: "Photos in this album",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "caption", title: "Caption (optional)", type: "string" }],
        },
      ],
      description: "These open on the album's page.",
    }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "place", media: "image" } },
});
