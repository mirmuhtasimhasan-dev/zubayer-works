import { defineType, defineField } from "sanity";

export default defineType({
  name: "workItem",
  title: "The Eye (Work)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug (URL)", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "category", title: "Category", type: "string", description: "e.g. Photography, Commercial, Documentary, Film" }),
    defineField({
      name: "type", title: "Type", type: "string",
      options: { list: [{ title: "Photo project", value: "photo" }, { title: "Film / Video", value: "video" }], layout: "radio" },
      initialValue: "photo",
    }),
    defineField({
      name: "format", title: "Grid size", type: "string",
      options: { list: [{ title: "Wide (full width)", value: "wide" }, { title: "Half", value: "half" }], layout: "radio" },
      initialValue: "half",
    }),
    defineField({ name: "cover", title: "Cover image (grid thumbnail)", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "videoEmbed", title: "Video embed URL (YouTube/Vimeo)", type: "url", description: "For films. e.g. https://www.youtube.com/embed/VIDEO_ID" }),
    defineField({ name: "images", title: "Project images (gallery)", type: "array", of: [{ type: "image", options: { hotspot: true } }], description: "Photos shown on the project page" }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "cover" } },
});
