/**
 * <OffClock> — the "Off the clock" interests row at the foot of the About column.
 * Seven monochrome line icons, each with an always-visible uppercase label. The
 * icons are the exact approved inline SVGs (no emoji, no icon dependency); labels
 * are the accessible names, icons are aria-hidden.
 */

/* ─────────────── Tunable ─────────────── */
const ICON_COLOR = "#2b2517"; // warm dark ink (set via CSS var --oc-ink)
// Order + labels. Add/remove/reorder here; each key maps to an icon below.
const INTERESTS: { key: string; label: string }[] = [
  { key: "basketball", label: "Basketball" },
  { key: "chess", label: "Chess" },
  { key: "pool", label: "Pool" },
  { key: "art", label: "Art" },
  { key: "film", label: "Film" },
  { key: "reading", label: "Reading" },
  { key: "riding", label: "Riding" },
];
/* ────────────────────────────────────── */

// Shared stroke attributes for every icon (Riding overrides strokeWidth to 1.6).
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "oc-icon",
  "aria-hidden": true,
};

function IconFor({ keyName }: { keyName: string }) {
  switch (keyName) {
    case "basketball":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <path d="M5.6 5.6c2.4 2.3 2.4 10.5 0 12.8" />
          <path d="M18.4 5.6c-2.4 2.3-2.4 10.5 0 12.8" />
        </svg>
      );
    case "chess":
      return (
        <svg {...base}>
          <circle cx="12" cy="6" r="2.3" />
          <path d="M9.8 8.4c-.7 1.1-.4 2.5.9 3.3-1.6.9-2.5 2.8-2.7 4.7h7.9c-.2-1.9-1.1-3.8-2.7-4.7 1.3-.8 1.6-2.2.9-3.3" />
          <path d="M7 20l.8-3h8.4l.8 3z" />
        </svg>
      );
    case "pool":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4.7" />
          <text
            x="12"
            y="14.6"
            fontSize="6.8"
            fontWeight="700"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontFamily="Inter, Arial, sans-serif"
          >
            8
          </text>
          <path d="M7.4 8a6 6 0 0 1 2.8-2.1" strokeWidth="1.2" />
        </svg>
      );
    case "art":
      return (
        <svg {...base}>
          <path d="M12 3.2C6.8 3.2 3 6.9 3 11.6c0 3.3 2.6 5.2 5.1 5.2 1 0 1.7.8 1.7 1.7 0 1.1 1 2 2.2 2 5 0 9-3.6 9-8.4 0-5-4-8.9-9-8.9z" />
          <circle cx="7.6" cy="11.3" r=".9" />
          <circle cx="10.6" cy="8" r=".9" />
          <circle cx="14.4" cy="8.1" r=".9" />
          <circle cx="16.8" cy="11.4" r=".9" />
        </svg>
      );
    case "film":
      return (
        <svg {...base}>
          <rect x="3" y="9.5" width="18" height="11" rx="1.2" />
          <rect x="3" y="5.8" width="18" height="3.7" rx="0.8" />
          <path d="M8 5.9 6.2 9.4M12 5.9 10.2 9.4M16 5.9 14.2 9.4" />
        </svg>
      );
    case "reading":
      return (
        <svg {...base}>
          <path d="M12 6.6C10 5.3 6.9 5.3 4.6 6.3v11.4c2.3-1 5.4-1 7.4.3 2-1.3 5.1-1.3 7.4-.3V6.3C17.1 5.3 14 5.3 12 6.6z" />
          <path d="M12 6.6v11.4" />
        </svg>
      );
    case "riding":
      return (
        <svg {...base} strokeWidth={1.6}>
          <circle cx="5.5" cy="16.5" r="2.9" />
          <circle cx="18.5" cy="16.5" r="2.9" />
          <path d="M8.4 16.5h4.6l2.2-3.3h-6l-1.6-2.4h3" />
          <path d="M5.5 16.5 8 13h5.3" />
          <path d="M15.2 13.2 18.5 16.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function OffClock() {
  return (
    <section className="offclock" style={{ ["--oc-ink" as string]: ICON_COLOR }}>
      <p className="oc-kick">Off the clock</p>
      <ul className="oc-row">
        {INTERESTS.map((it) => (
          <li className="oc-item" key={it.key}>
            <IconFor keyName={it.key} />
            <span className="oc-label">{it.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
