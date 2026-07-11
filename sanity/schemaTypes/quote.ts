import { defineType, defineField } from "sanity";

// Rotating pull-quotes shown above the Writing section. The client adds / edits /
// reorders these in the Studio.
export default defineType({
  name: "quote",
  title: "Quotes (Writing)",
  type: "document",
  fields: [
    defineField({ name: "text", title: "Quote", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
  ],
  preview: {
    select: { title: "text", subtitle: "order" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle != null ? `#${subtitle}` : undefined }),
  },
});
