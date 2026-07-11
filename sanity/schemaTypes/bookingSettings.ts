import { defineType, defineField } from "sanity";

export default defineType({
  name: "bookingSettings",
  title: "Booking Settings",
  type: "document",
  fields: [
    defineField({
      name: "timeSlots",
      title: "Time slots (bookable times for a day)",
      type: "array",
      of: [{ type: "string" }],
      initialValue: ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"],
    }),
    defineField({
      name: "leadDays",
      title: "Lead days (earliest bookable day is today + this many)",
      type: "number",
      initialValue: 1,
      description: "1 means bookings start tomorrow.",
    }),
    defineField({
      name: "blockedDates",
      title: "Blocked dates (unavailable days)",
      type: "array",
      of: [{ type: "date", options: { dateFormat: "YYYY-MM-DD" } }],
    }),
  ],
  preview: { prepare: () => ({ title: "Booking Settings" }) },
});
