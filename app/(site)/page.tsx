import Nav from "@/components/Nav";
import Opening from "@/components/Opening";
import Work from "@/components/Work";
import Archive from "@/components/Archive";
import Ventures from "@/components/Ventures";
import Writing from "@/components/Writing";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import { getFeaturedWork, getWorkCategories, getGallery, getArchiveSettings, getVentures, getWriting } from "@/sanity/lib/queries";

export const revalidate = 30;

// ---- FIXED text (not managed in Sanity). Edit here to change hero / about / footer. ----
const HERO = {
  location: "Dhaka, Bangladesh — Filmmaker & Brand Consultant",
  headline: "Some people choose a lane. I chose a problem.",
  subText: "I make films, build brands, and start companies. Trained in architecture, shaped by media, sharpened in Japan.",
};

// The About section now lives on its own /about page, managed in Sanity.

const FOOTER = {
  email: "hello@zubayer.works",
  locationLabel: "Dhaka, Bangladesh",
  footerLine: "Mostly making things. Occasionally on time.",
};

export default async function Home() {
  const [featuredWork, workCategories, gallery, archiveSettings, ventures, writing] = await Promise.all([
    getFeaturedWork(), getWorkCategories(), getGallery(), getArchiveSettings(), getVentures(), getWriting(),
  ]);
  return (
    <main>
      <Nav />
      <Opening location={HERO.location} headline={HERO.headline} subText={HERO.subText} />
      <Work featured={featuredWork} categories={workCategories} />
      <Archive images={gallery} behanceUrl={archiveSettings?.behanceUrl} />
      <Ventures ventures={ventures} />
      <Writing posts={writing} />
      <Services />
      <Contact settings={FOOTER} />
    </main>
  );
}
