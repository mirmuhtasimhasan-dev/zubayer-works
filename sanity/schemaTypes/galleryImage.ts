import { defineType, defineField } from "sanity";

export default defineType({
  name: "galleryImage",
  title: "The Archive (Gallery)",
  type: "document",
  fields: [
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "caption", media: "image" } },
});
