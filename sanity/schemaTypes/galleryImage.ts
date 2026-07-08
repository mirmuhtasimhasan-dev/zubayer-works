import { defineType, defineField } from "sanity";

export default defineType({
  name: "galleryImage",
  title: "The Archive (Gallery)",
  type: "document",
  fields: [
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title (short caption)", type: "string" }),
    defineField({ name: "place", title: "Place / date", type: "string", description: 'e.g. "Rangamati" or a date' }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "place", media: "image" } },
});
