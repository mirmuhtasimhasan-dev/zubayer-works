import { defineType, defineField } from "sanity";

export default defineType({
  name: "writingPiece",
  title: "Writing (A Shoebox Under the Bed)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug (URL)", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({
      name: "category", title: "Category", type: "string",
      options: { list: [{ title: "Essay", value: "Essay" }, { title: "Journal", value: "Journal" }], layout: "radio" },
      initialValue: "Essay",
    }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 2 }),
    defineField({ name: "cover", title: "Cover image (optional)", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", title: "Body (one paragraph per item)", type: "array", of: [{ type: "text", rows: 4 }] }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
