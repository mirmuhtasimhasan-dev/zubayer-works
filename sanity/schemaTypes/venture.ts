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
    defineField({
      name: "kicker",
      title: "Small line above the name (card)",
      description: 'The little uppercase label at the top of the card, e.g. "Studio" or "2021 - now". Leave empty to hide it.',
      type: "string",
    }),
    defineField({
      name: "backgroundImage",
      title: "Card background photo",
      type: "image",
      options: { hotspot: true },
      description: "Fills the whole card behind the text. Leave empty for the plain card.",
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({ name: "shortText", title: "Short text (one line under the title)", type: "string" }),
    defineField({
      name: "cardTheme",
      title: "Logo-card background (only when there is no background photo)",
      type: "string",
      options: {
        list: [
          { title: "Dark (black card, logo on the right)", value: "dark" },
          { title: "Light (white card, logo on the right)", value: "light" },
        ],
        layout: "radio",
      },
      initialValue: "dark",
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "description", title: "Short description (card)", type: "text", rows: 3 }),
    // Small link icons under the card description. Use whichever fits: a website,
    // or a YouTube channel/video (e.g. Loadshedding).
    defineField({ name: "websiteUrl", title: "Website link (card)", type: "url", description: "Shows a globe icon under the description." }),
    defineField({ name: "youtubeUrl", title: "YouTube link (card)", type: "url", description: "Shows a YouTube icon under the description." }),
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
