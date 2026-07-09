import { defineType, defineField } from "sanity";

export default defineType({
  name: "venture",
  title: "Ventures",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (page URL)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
      description: "Auto-filled from the name — the venture opens at /ventures/<slug>.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      description: "Shown on the venture card (a transparent PNG works best).",
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "description", title: "Short description (card)", type: "text", rows: 3 }),
    defineField({
      name: "body",
      title: "Full description (its page)",
      type: "array",
      of: [{ type: "block" }],
      description: "The longer write-up shown on the venture's own page.",
    }),
    defineField({ name: "inquiryEmail", title: "Inquiry email", type: "string" }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "tagline", media: "logo" } },
});
