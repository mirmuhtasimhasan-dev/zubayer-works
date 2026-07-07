import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "locationLabel", title: "Location label (nav/hero)", type: "string" }),
    defineField({ name: "headline", title: "Hero headline", type: "text", rows: 2 }),
    defineField({ name: "subText", title: "Hero sub text", type: "text", rows: 3 }),
    defineField({ name: "aboutTitle", title: "About title", type: "string" }),
    defineField({ name: "aboutIntro", title: "About intro", type: "text", rows: 2 }),
    defineField({ name: "aboutBody", title: "About paragraphs", type: "array", of: [{ type: "text", rows: 3 }] }),
    defineField({ name: "portrait", title: "Portrait image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "disciplineTable", title: "Discipline table", type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "institution", title: "Institution", type: "string" },
          { name: "credits", title: "Credits", type: "string" },
          { name: "location", title: "Location", type: "string" },
        ],
      }],
    }),
    defineField({ name: "email", title: "Contact email", type: "string" }),
    defineField({ name: "footerLine", title: "Footer line", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
