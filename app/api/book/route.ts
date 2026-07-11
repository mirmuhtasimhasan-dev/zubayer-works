import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";

// YYYY-MM-DD for "today" (UTC, matches how dates are stored/compared as strings).
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const sessionType = typeof body.sessionType === "string" ? body.sessionType.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const timeSlot = typeof body.timeSlot === "string" ? body.timeSlot.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  // Validate required fields.
  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!sessionType) missing.push("session type");
  if (!date) missing.push("date");
  if (!timeSlot) missing.push("time");
  if (missing.length) {
    return NextResponse.json({ ok: false, error: `Please add your ${missing.join(", ")}.` }, { status: 400 });
  }

  // Load settings for the availability rules.
  const settings = await writeClient.fetch<{ timeSlots?: string[]; leadDays?: number; blockedDates?: string[] } | null>(
    `*[_type == "bookingSettings"][0]{ timeSlots, leadDays, blockedDates }`
  );
  const timeSlots = settings?.timeSlots ?? ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"];
  const leadDays = typeof settings?.leadDays === "number" ? settings.leadDays : 1;
  const blocked = settings?.blockedDates ?? [];

  const today = todayStr();
  const earliest = addDays(today, leadDays);

  if (date < today) {
    return NextResponse.json({ ok: false, error: "That day has already passed." }, { status: 400 });
  }
  if (date < earliest) {
    return NextResponse.json({ ok: false, error: "That day is not open for booking yet." }, { status: 400 });
  }
  if (blocked.includes(date)) {
    return NextResponse.json({ ok: false, error: "That day is unavailable." }, { status: 400 });
  }
  if (!timeSlots.includes(timeSlot)) {
    return NextResponse.json({ ok: false, error: "That time is not available." }, { status: 400 });
  }

  // Authoritative double-booking guard (fresh, non-cached read).
  const clash = await writeClient.fetch<number>(
    `count(*[_type == "booking" && date == $date && timeSlot == $timeSlot && status != "cancelled"])`,
    { date, timeSlot }
  );
  if (clash > 0) {
    return NextResponse.json(
      { ok: false, error: "That time was just taken. Please pick another." },
      { status: 409 }
    );
  }

  // Create the booking.
  try {
    await writeClient.create({
      _type: "booking",
      name,
      email,
      whatsapp,
      sessionType,
      date,
      timeSlot,
      note,
      status: "new",
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Booking create failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save the booking. Please try again." }, { status: 500 });
  }

  // Notify the owner + confirm the visitor via n8n. A failure here must NOT break
  // the booking, which is already saved.
  const hook = process.env.N8N_BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, sessionType, date, timeSlot, note }),
      });
    } catch (err) {
      console.error("Booking webhook failed (booking still saved):", err);
    }
  }

  return NextResponse.json({ ok: true });
}
