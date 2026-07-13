import { defineField, defineType } from "sanity";

// Singleton: where the Writing section's "Read everything on Substack" button
// points. The essays themselves come from the Substack RSS feed.
export default defineType({
  name: "writingSettings",
  title: "Writing Settings",
  type: "document",
  fields: [
    defineField({
      name: "substackUrl",
      title: "Substack URL",
      description: "Where the button at the end of the Writing section links to.",
      type: "url",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Writing Settings" }),
  },
});
