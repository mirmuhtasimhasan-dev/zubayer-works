import { Cormorant_Garamond, Inter } from "next/font/google";
import CursorDot from "@/components/CursorDot";
import MusicProvider from "@/components/MusicProvider";
import { SoundCorner, SoundPill } from "@/components/SoundControls";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} site`}>
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