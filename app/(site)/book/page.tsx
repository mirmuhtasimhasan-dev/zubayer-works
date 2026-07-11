import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Book a session - Zubayer Ahmed" };

export default async function BookPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [settings, taken] = await Promise.all([
    client.fetch(
      `*[_type == "bookingSettings"][0]{ timeSlots, leadDays, blockedDates }`,
      {},
      { cache: "no-store" }
    ),
    client.fetch(
      `*[_type == "booking" && status != "cancelled" && date >= $today]{ date, timeSlot }`,
      { today },
      { cache: "no-store" }
    ),
  ]);

  return (
    <BookingForm
      today={today}
      timeSlots={settings?.timeSlots ?? []}
      leadDays={typeof settings?.leadDays === "number" ? settings.leadDays : 1}
      blockedDates={settings?.blockedDates ?? []}
      taken={taken ?? []}
    />
  );
}
