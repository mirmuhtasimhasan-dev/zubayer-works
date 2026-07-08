import { defineType, defineField } from "sanity";

// Singleton for The Archive's settings — currently the Behance link used by the
// end-of-row card. The client sets/changes it in Studio.
export default defineType({
  name: "archiveSettings",
  title: "Archive Settings",
  type: "document",
  fields: [
    defineField({
      name: "behanceUrl",
      title: "Behance URL",
      type: "url",
      description: "The 'See the full archive on Behance' card at the end of the row links here.",
    }),
  ],
  preview: { prepare: () => ({ title: "Archive Settings" }) },
});
