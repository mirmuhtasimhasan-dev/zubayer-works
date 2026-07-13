import { defineField, defineType } from "sanity";

// An "Engagement" = one service card on the home page + its own /services/[slug]
// page. Add, reorder, edit or remove them here; the home grid keeps three per row
// and flows extras onto the next row automatically.
export default defineType({
  name: "engagement",
  title: "Engagement",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (the page address)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "blurb",
      title: "Card line",
      description: "The one short line shown on the home page card.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Film", value: "film" },
          { title: "Play", value: "play" },
          { title: "Compass", value: "compass" },
          { title: "Camera", value: "camera" },
          { title: "Pen", value: "pen" },
        ],
        layout: "radio",
      },
      initialValue: "film",
    }),
    defineField({
      name: "description",
      title: "Paragraphs (detail page)",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "cta",
      title: "Closing line (above the Book a session link)",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Lower numbers come first.",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "blurb" },
  },
});
