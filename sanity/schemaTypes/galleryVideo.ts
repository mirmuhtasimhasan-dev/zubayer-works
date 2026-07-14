import { defineType, defineField } from "sanity";

// Videos shown under the Gallery page's "Videography" tab. The client just pastes
// a YouTube/Vimeo link; the thumbnail is pulled from it automatically.
export default defineType({
  name: "galleryVideo",
  title: "Gallery — Videography",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "videoUrl",
      title: "Video link (YouTube / Vimeo)",
      type: "url",
      validation: (r) => r.required(),
      description: "The thumbnail is taken from this link; clicking the tile plays the video.",
    }),
    defineField({
      name: "cover",
      title: "Custom thumbnail (optional)",
      type: "image",
      options: { hotspot: true },
      description: "Only set this to override the auto thumbnail from the link.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description:
        "Videos are grouped by category on the Gallery page, under a heading. Leave empty and it goes in the ungrouped set at the bottom.",
    }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: {
    select: { title: "title", subtitle: "category.name", media: "cover" },
  },
});
