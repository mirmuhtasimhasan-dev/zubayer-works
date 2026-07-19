import { NextResponse } from "next/server";
import { Resend } from "resend";
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
  // NOTE: timeSlot is optional for now — the "Choose a time" step is parked in the
  // form. The slot rules below still apply whenever a slot IS sent, so restoring
  // the step needs no change here.
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
  if (timeSlot && !timeSlots.includes(timeSlot)) {
    return NextResponse.json({ ok: false, error: "That time is not available." }, { status: 400 });
  }

  // Authoritative double-booking guard (fresh, non-cached read). Only meaningful
  // when a slot was picked — without one, several bookings may share a day.
  if (timeSlot) {
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

  // Notify the owner via Resend. The booking is already saved above, so any email
  // problem is logged LOUDLY (never swallowed). TEMP debug logs (marked below) can
  // be removed once this is confirmed working in production.
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  const owner = process.env.OWNER_EMAIL;
  // TEMP debug
  console.log("[booking] handler reached email step", {
    hasResendKey: !!resendKey,
    from,
    owner,
  });

  if (!resendKey || !from || !owner) {
    // Fail loudly rather than silently returning — this is exactly the case that
    // produced "no runtime error AND no Resend log".
    console.error("[booking] missing email env vars", {
      hasResendKey: !!resendKey,
      hasFrom: !!from,
      hasOwner: !!owner,
    });
    return NextResponse.json(
      { ok: false, error: "Booking saved, but the notification email is misconfigured on the server." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(resendKey);
    console.log("[booking] calling resend..."); // TEMP debug
    const result = await resend.emails.send({
      from,
      to: owner,
      replyTo: email,
      subject: `New booking — ${name} · ${sessionType} · ${date}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        whatsapp ? `WhatsApp: ${whatsapp}` : null,
        `Session: ${sessionType}`,
        `Date: ${date}`,
        timeSlot ? `Time: ${timeSlot}` : null,
        note ? `Note: ${note}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    console.log("[booking] resend result", result); // TEMP debug
    if (result.error) {
      console.error("[booking] resend error", result.error);
      return NextResponse.json(
        { ok: false, error: "Booking saved, but the confirmation email failed to send." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[booking] resend threw", err);
    return NextResponse.json(
      { ok: false, error: "Booking saved, but the confirmation email failed to send." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
