import { defineType, defineField } from "sanity";

export default defineType({
  name: "booking",
  title: "Bookings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", title: "Email", type: "string", validation: (r) => r.required() }),
    defineField({ name: "whatsapp", title: "WhatsApp", type: "string" }),
    defineField({
      name: "sessionType",
      title: "Session type",
      type: "string",
      options: {
        list: [
          { title: "Documentary film", value: "Documentary film" },
          { title: "Advertisement", value: "Advertisement" },
          { title: "Photography", value: "Photography" },
          { title: "A first chat", value: "A first chat" },
        ],
      },
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "timeSlot", title: "Time slot", type: "string", validation: (r) => r.required() }),
    defineField({ name: "note", title: "Note", type: "text" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Done", value: "done" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "new",
    }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", date: "date", timeSlot: "timeSlot" },
    prepare: ({ name, date, timeSlot }) => ({
      title: name || "Booking",
      subtitle: [date, timeSlot].filter(Boolean).join("  |  "),
    }),
  },
});
