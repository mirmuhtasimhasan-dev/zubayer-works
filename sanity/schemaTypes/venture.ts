import { defineType, defineField } from "sanity";

export default defineType({
  name: "venture",
  title: "Ventures",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "inquiryEmail", title: "Inquiry email", type: "string" }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "tagline" } },
});
