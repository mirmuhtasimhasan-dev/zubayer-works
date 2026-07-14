import Nav from "@/components/Nav";
import Opening from "@/components/Opening";
import Work from "@/components/Work";
import Archive from "@/components/Archive";
import Ventures from "@/components/Ventures";
import Writing from "@/components/Writing";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import { getFeaturedWork, getWorkCategories, getGallery, getArchiveSettings, getVentures, getQuotes, getEngagements, getWritingSettings } from "@/sanity/lib/queries";
import { getSubstackPosts } from "@/lib/substack";

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

// Shown only until the client adds their own "Quotes (Writing)" in the Studio —
// any Sanity quotes replace these.
const DEFAULT_QUOTES = [
  "Some things are only ever true at 3 a.m.",
  "Every essay is a letter I never got around to sending.",
  "Memory is a shoebox — mostly dust, and a few things that still cut.",
];

export default async function Home() {
  const [featuredWork, workCategories, gallery, archiveSettings, ventures, writing, quotes, engagements, writingSettings] = await Promise.all([
    getFeaturedWork(), getWorkCategories(), getGallery(), getArchiveSettings(), getVentures(), getSubstackPosts(9), getQuotes(), getEngagements(), getWritingSettings(),
  ]);
  return (
    <main>
      <Nav />
      <Opening location={HERO.location} headline={HERO.headline} subText={HERO.subText} />
      <Work featured={featuredWork} categories={workCategories} />
      <Archive albums={gallery} behanceUrl={archiveSettings?.behanceUrl} />
      <Ventures ventures={ventures} />
      <Writing
        posts={writing}
        quotes={quotes?.length ? quotes : DEFAULT_QUOTES}
        substackUrl={writingSettings?.substackUrl}
      />
      <Services items={engagements} />
      <Contact settings={FOOTER} />
    </main>
  );
}
