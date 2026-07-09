import { defineType, defineField } from "sanity";

export default defineType({
  name: "workItem",
  title: "The Eye (Work)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    // Video-only now (Still Photos removed) — hidden; works default to video.
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      initialValue: "video",
      hidden: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this one full-width at the top of The Eye (only the first featured item is used).",
      initialValue: false,
    }),
    defineField({
      name: "cover",
      title: "Cover / thumbnail (optional)",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. For video works, leave this empty and the thumbnail is pulled from the video link automatically. Set it only to override.",
    }),
    // Photo works were removed (video only) — hidden, kept for existing data.
    defineField({
      name: "image",
      title: "Photo (full image)",
      type: "image",
      options: { hotspot: true },
      hidden: true,
    }),
    defineField({
      name: "videoEmbed",
      title: "Video URL (YouTube / Vimeo)",
      type: "url",
      description: "For video works — the play button opens this. (YouTube/Vimeo can't do the liquid hover effect — upload a file below for that.)",
    }),
    defineField({
      name: "videoFile",
      title: "Video file (MP4 / WebM) — for the liquid hover + inline autoplay",
      type: "file",
      options: { accept: "video/*" },
      description: "Upload the film as a direct file to get the liquid ripple on hover, inline autoplay, and full quality. Falls back to the YouTube/Vimeo link above if empty.",
    }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: {
    select: { title: "title", media: "cover", kind: "kind" },
    prepare: ({ title, media, kind }) => ({ title, subtitle: kind ? kind : undefined, media }),
  },
});
