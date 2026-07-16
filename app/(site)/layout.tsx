import { Cinzel, Cormorant_Garamond, Manrope, Schibsted_Grotesk, Spectral, Source_Serif_4 } from "next/font/google";
import CursorDot from "@/components/CursorDot";
import MusicProvider from "@/components/MusicProvider";
import { SoundCorner, SoundPill } from "@/components/SoundControls";

// Schibsted Grotesk is now the face across the whole site (headings + body) —
// everything EXCEPT the opening/hero and the navbar. next/font ships a
// size-adjusted fallback, so there is no layout shift when it loads.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-schibsted",
  display: "swap",
});

// Manrope — used only inside the venture ("Thoughts in Motion") boxes.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

// Source Serif 4 is kept ONLY for the navbar now (logo + links), pinned so it
// does not change when the site default flips to Schibsted.
const nav = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
  variable: "--font-nav",
  display: "optional",
});

// …the hero headline keeps Cormorant Garamond.
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
    <div className={`${schibsted.variable} ${manrope.variable} ${nav.variable} ${hero.variable} ${body.variable} ${quote.variable} site`}>
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