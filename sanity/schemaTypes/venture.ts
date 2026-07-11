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
      title: "Page content (text, images & videos)",
      type: "array",
      description:
        "Build the venture's page here — add text, images, and video links in any order (e.g. an image, then text, then more images/videos).",
      of: [
        { type: "block" },
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [{ name: "caption", title: "Caption (optional)", type: "string" }],
        },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video (YouTube / Vimeo)",
          fields: [
            { name: "url", title: "Video link", type: "url", validation: (r) => r.required() },
            { name: "caption", title: "Caption (optional)", type: "string" },
          ],
          preview: { select: { subtitle: "url", title: "caption" }, prepare: ({ title, subtitle }) => ({ title: title || "Video", subtitle }) },
        },
      ],
    }),
    defineField({ name: "inquiryEmail", title: "Inquiry email", type: "string" }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "tagline", media: "logo" } },
});
