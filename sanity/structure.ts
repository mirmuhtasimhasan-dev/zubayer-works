import type { StructureResolver } from "sanity/structure";

// Show the About Page as a single fixed document (a singleton) so the client
// edits one page instead of being able to create duplicates.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Archive Settings")
        .id("archiveSettings")
        .child(S.document().schemaType("archiveSettings").documentId("archiveSettings")),
      S.listItem()
        .title("Writing Settings")
        .id("writingSettings")
        .child(S.document().schemaType("writingSettings").documentId("writingSettings")),
      S.listItem()
        .title("Booking Settings")
        .id("bookingSettings")
        .child(S.document().schemaType("bookingSettings").documentId("bookingSettings")),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (li) => !["aboutPage", "archiveSettings", "bookingSettings", "writingSettings"].includes(li.getId() as string)
      ),
    ]);
