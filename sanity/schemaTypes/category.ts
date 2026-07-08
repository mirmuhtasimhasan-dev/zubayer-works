import { defineType, defineField } from "sanity";

// Categories power The Eye. The client creates/renames/reorders these under one
// of two groups, then files work items under a category.
export default defineType({
  name: "category",
  title: "Work Category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      options: {
        list: [
          { title: "Videography", value: "Videography" },
          { title: "Still Photos", value: "Still Photos" },
        ],
        layout: "radio",
      },
      initialValue: "Videography",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
    defineField({
      name: "cover",
      title: "Category tile image (optional)",
      type: "image",
      options: { hotspot: true },
      description: "Shown on the category tile. If empty, a group icon is used.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "group", media: "cover" },
  },
});
