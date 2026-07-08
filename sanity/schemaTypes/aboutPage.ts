import { defineType, defineField } from "sanity";

// Singleton document for the standalone /about page. The client writes the
// whole page here (rich text), plus an optional portrait/top image.
export default defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow (small label above the title)",
      type: "string",
      initialValue: "About",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portrait / top image (optional)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Body — write everything here",
      description: "Full rich text: headings, paragraphs, lists, bold, links.",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "About Page" }),
  },
});
