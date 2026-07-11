import { defineType, defineField } from "sanity";

// Categories power The Eye (Videography). The client creates/renames/reorders
// these, then files work items under a category.
export default defineType({
  name: "category",
  title: "Work Category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (page URL)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      description: "Auto-filled from the name — the category's page opens at /eye/<slug>.",
    }),
    // Kept only so existing content/queries stay valid; always "Videography" now
    // (Still Photos was removed), so it's hidden from the editor.
    defineField({ name: "group", title: "Group", type: "string", initialValue: "Videography", hidden: true }),
    defineField({ name: "order", title: "Order (lower = first)", type: "number" }),
    defineField({
      name: "cover",
      title: "Category tile image (optional)",
      type: "image",
      options: { hotspot: true },
      description: "Shown on the category tile. If empty, a video icon is used.",
    }),
  ],
  preview: {
    select: { title: "name", media: "cover" },
  },
});
