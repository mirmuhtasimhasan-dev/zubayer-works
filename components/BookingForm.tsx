"use client";
import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

/* ------------- Tunable ------------- */
const ACCENT = "#9c6b43"; // warm brown accent
const FALLBACK_SLOTS = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"];
/* ----------------------------------- */

const OPTIONS = [
  { value: "Documentary film", title: "Documentary film", desc: "Long-form, story-driven work" },
  { value: "Advertisement", title: "Advertisement", desc: "Brand and product films" },
  { value: "Photography", title: "Photography", desc: "Portraits, editorial, events" },
  { value: "A first chat", title: "Just a chat", desc: "Not sure yet, let us explore it" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function iso(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function addDays(isoStr: string, n: number) {
  const [y, m, d] = isoStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function fmtShort(isoStr: string) {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

interface Props {
  today: string;
  timeSlots: string[];
  leadDays: number;
  blockedDates: string[];
  taken: { date: string; timeSlot: string }[];
}

export default function BookingForm({ today, timeSlots, leadDays, blockedDates, taken }: Props) {
  const slots = timeSlots && timeSlots.length ? timeSlots : FALLBACK_SLOTS;
  const earliest = addDays(today, Math.max(0, leadDays || 0));
  const [ty, tm] = [Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1];

  const [sessionType, setSessionType] = useState("");
  const [day, setDay] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [cursor, setCursor] = useState({ y: ty, m: tm });
  const [extraTaken, setExtraTaken] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const takenSet = useMemo(
    () => new Set([...taken.map((t) => `${t.date}|${t.timeSlot}`), ...extraTaken]),
    [taken, extraTaken]
  );
  const blocked = useMemo(() => new Set(blockedDates || []), [blockedDates]);

  const allSlotsTaken = (d: string) => slots.every((s) => takenSet.has(`${d}|${s}`));
  const dayDisabled = (d: string) => d < earliest || blocked.has(d) || allSlotsTaken(d);

  // Calendar grid for the cursor month.
  const firstWeekday = new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prevDisabled = cursor.y < ty || (cursor.y === ty && cursor.m <= tm);
  const stepMonth = (dir: number) => {
    if (dir < 0 && prevDisabled) return;
    const next = new Date(Date.UTC(cursor.y, cursor.m + dir, 1));
    setCursor({ y: next.getUTCFullYear(), m: next.getUTCMonth() });
  };

  const sessionTitle = OPTIONS.find((o) => o.value === sessionType)?.title || "";
  const summary = [sessionTitle, day ? fmtShort(day) : "", timeSlot].filter(Boolean).join("  /  ");

  async function submit() {
    setError("");
    const need: string[] = [];
    if (!sessionType) need.push("a session type");
    if (!day) need.push("a day");
    if (!name.trim()) need.push("your name");
    if (!email.trim()) need.push("your email");
    if (need.length) { setError(`Please choose ${need.join(", ")}.`); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, sessionType, date: day, timeSlot, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(true);
      } else if (res.status === 409) {
        setExtraTaken((p) => [...p, `${day}|${timeSlot}`]);
        setTimeSlot("");
        setError(data.error || "That time was just taken. Please pick another.");
      } else if (res.status === 400) {
        setError(data.error || "Please check the form and try again.");
      } else {
        setError(data.error || "Something went wrong, please try again.");
      }
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(false);
    setSessionType(""); setDay(""); setTimeSlot("");
    setName(""); setEmail(""); setWhatsapp(""); setNote("");
    setError("");
  }

  const rootStyle = { ["--bk-accent"]: ACCENT } as CSSProperties;

  return (
    <div className="bk" style={rootStyle}>
      <header className="bk-bar">
        <span className="bk-wordmark">Zubayer Ahmed</span>
        <Link href="/" className="bk-back"><span aria-hidden>&#8592;</span> Back to portfolio</Link>
      </header>

      {done ? (
        <main className="bk-main">
          <div className="bk-confirm bk-reveal" style={{ ["--i" as string]: 0 } as CSSProperties}>
            <span className="bk-check" aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="21" className="bk-check-ring" />
                <path d="M15 24.5l6 6 12-13" className="bk-check-tick" />
              </svg>
            </span>
            <h1 className="bk-title">You are <em>on the calendar.</em></h1>
            <p className="bk-recap">{sessionTitle}<span className="bk-dot">&#183;</span>{fmtShort(day)}</p>
            <p className="bk-lede">A confirmation is on its way to your email, and Zubayer gets a WhatsApp nudge too.</p>
            <button className="bk-startover" onClick={reset}>Start over</button>
          </div>
        </main>
      ) : (
        <main className="bk-main">
          <div className="bk-head bk-reveal" style={{ ["--i" as string]: 0 } as CSSProperties}>
            <p className="bk-kicker"><span className="bk-rule" />Book a session</p>
            <h1 className="bk-title">Let us start with a <em>conversation.</em></h1>
            <p className="bk-lede">Pick what we are making and a day that works, then leave your details. I will take it from there.</p>
          </div>

          {/* 01 session type */}
          <section className="bk-sec bk-reveal" style={{ ["--i" as string]: 1 } as CSSProperties}>
            <div className="bk-sec-head"><span className="bk-idx">01</span><span className="bk-label">What are we making</span></div>
            <div className="bk-options">
              {OPTIONS.map((o) => {
                const on = sessionType === o.value;
                return (
                  <button key={o.value} type="button" className={`bk-opt ${on ? "is-on" : ""}`} onClick={() => setSessionType(o.value)} aria-pressed={on}>
                    <span className="bk-opt-txt">
                      <span className="bk-opt-title">{o.title}</span>
                      <span className="bk-opt-desc">{o.desc}</span>
                    </span>
                    <span className="bk-radio" aria-hidden>
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10.5l3.2 3.2L15 6.5" /></svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 02 day */}
          <section className="bk-sec bk-reveal" style={{ ["--i" as string]: 2 } as CSSProperties}>
            <div className="bk-sec-head"><span className="bk-idx">02</span><span className="bk-label">Choose a day</span></div>
            <div className="bk-cal">
              <div className="bk-cal-top">
                <button type="button" className="bk-cal-nav" onClick={() => stepMonth(-1)} disabled={prevDisabled} aria-label="Previous month">&#8249;</button>
                <span className="bk-cal-month">{MONTHS[cursor.m]} {cursor.y}</span>
                <button type="button" className="bk-cal-nav" onClick={() => stepMonth(1)} aria-label="Next month">&#8250;</button>
              </div>
              <div className="bk-cal-week">{WEEK.map((w, i) => <span key={i}>{w}</span>)}</div>
              <div className="bk-cal-grid">
                {cells.map((d, i) => {
                  if (d === null) return <span key={i} className="bk-cal-blank" />;
                  const ds = iso(cursor.y, cursor.m, d);
                  const disabled = dayDisabled(ds);
                  const on = day === ds;
                  const isToday = ds === today;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`bk-cal-day ${on ? "is-on" : ""} ${isToday ? "is-today" : ""}`}
                      disabled={disabled}
                      onClick={() => { setDay(ds); setTimeSlot(""); }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* The "Choose a time" step is parked for now — the slot machinery
              (settings, API, schema) is all still in place, so bringing it back is
              just restoring this section and the `timeSlot` requirement. */}

          {/* 03 details */}
          <section className="bk-sec bk-reveal" style={{ ["--i" as string]: 3 } as CSSProperties}>
            <div className="bk-sec-head"><span className="bk-idx">03</span><span className="bk-label">Your details</span></div>
            <div className="bk-fields">
              <label className="bk-field"><span className="bk-field-lab">Name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /><span className="bk-underline" /></label>
              <label className="bk-field"><span className="bk-field-lab">Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" inputMode="email" /><span className="bk-underline" /></label>
              <label className="bk-field"><span className="bk-field-lab">WhatsApp</span><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" autoComplete="tel" /><span className="bk-underline" /></label>
              <label className="bk-field bk-field-wide"><span className="bk-field-lab">A line about your project</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /><span className="bk-underline" /></label>
            </div>
          </section>

          {error && <p className="bk-error bk-reveal" role="alert">{error}</p>}

          <div className="bk-confirm-row bk-reveal" style={{ ["--i" as string]: 4 } as CSSProperties}>
            <button type="button" className="bk-btn" onClick={submit} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm booking"} <span className="bk-btn-arrow" aria-hidden>&#8594;</span>
            </button>
            {summary && <span className="bk-summary">{summary}</span>}
          </div>

          <p className="bk-fine bk-reveal" style={{ ["--i" as string]: 5 } as CSSProperties}>
            <span className="bk-fine-item"><i />A 30 minute call</span>
            <span className="bk-fine-item"><i />Replies within a day</span>
            <span className="bk-fine-item"><i />Free, always</span>
          </p>
        </main>
      )}
    </div>
  );
}
