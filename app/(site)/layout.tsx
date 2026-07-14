import { Cinzel, Cormorant_Garamond, Spectral, Source_Serif_4 } from "next/font/google";
import CursorDot from "@/components/CursorDot";
import MusicProvider from "@/components/MusicProvider";
import { SoundCorner, SoundPill } from "@/components/SoundControls";

// Source Serif 4 is the face across the whole site…
const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
  variable: "--font-display",
  // "optional" instead of "swap": a late swap re-wraps headings and shifts the
  // cards after they have already painted.
  display: "optional",
});

// …except the hero headline and the nav, which keep Cormorant Garamond.
const hero = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-hero",
  display: "swap",
});

// The rotating pull-quotes only. Cinzel is a TITLING face — its character lives in
// the capitals, so the quote is set in caps (see .quote-text).
const quote = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-quote",
  display: "swap",
});

// Body copy: Spectral (a text serif) in place of the old sans.
const body = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${hero.variable} ${body.variable} ${quote.variable} site`}>
      <MusicProvider>
        {children}
        <CursorDot />
        {/* The pill is a flourish (desktop only); the corner toggle is the one
            control that is always there, on every device. */}
        <SoundPill />
        <SoundCorner />
      </MusicProvider>
    </div>
  );
}