import { defineType, defineField, defineArrayMember } from "sanity";

// Singleton for the /engagements/affiliates page. The client edits the header
// copy and the affiliations list (grouped by category, ordered within a group).
export default defineType({
  name: "affiliatesPage",
  title: "Affiliates Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow (small label above the title)",
      type: "string",
      initialValue: "Affiliates",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Affiliations",
    }),
    defineField({
      name: "lead",
      title: "Lead (intro line)",
      type: "text",
      rows: 3,
      description:
        "Wrap a clause in *asterisks* to render it as a Cormorant italic serif accent, e.g. \"...*where the thinking was formed*...\".",
    }),
    defineField({
      name: "affiliations",
      title: "Affiliations",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "affiliation",
          fields: [
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  { title: "Academic", value: "academic" },
                  { title: "Professional", value: "professional" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: "institution", title: "Institution", type: "string", validation: (r) => r.required() }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({
              name: "logo",
              title: "Logo",
              type: "image",
              options: { hotspot: true },
              description: "Transparent PNG or SVG. Shown warm-monochrome, colour on hover.",
              fields: [{ name: "alt", title: "Alt text", type: "string" }],
            }),
            defineField({ name: "url", title: "Website (optional)", type: "url" }),
          ],
          preview: {
            select: { title: "institution", subtitle: "role", media: "logo", category: "category" },
            prepare: ({ title, subtitle, media, category }) => ({
              title: title || "Untitled",
              subtitle: [category, subtitle].filter(Boolean).join(" · "),
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: title || "Affiliates Page" }) },
});
