import Nav from "@/components/Nav";
import Opening from "@/components/Opening";
import Work from "@/components/Work";
import Archive from "@/components/Archive";
import About from "@/components/About";
import Ventures from "@/components/Ventures";
import Writing from "@/components/Writing";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import { getWork, getGallery, getVentures, getWriting } from "@/sanity/lib/queries";

export const revalidate = 30;

// ---- FIXED text (not managed in Sanity). Edit here to change hero / about / footer. ----
const HERO = {
  location: "Dhaka, Bangladesh — Filmmaker & Brand Consultant",
  headline: "Some people choose a lane. I chose a problem.",
  subText: "I make films, build brands, and start companies. Trained in architecture, shaped by media, sharpened in Japan.",
};

const ABOUT = {
  aboutTitle: "A Crooked Line, Drawn Deliberately",
  aboutIntro: "I never picked one thing. I picked one question and followed it across disciplines.",
  aboutBody: [
    "I started in architecture, learning how structure carries meaning before a single word is spoken.",
    "Then media pulled me in, and I found the same rules applied to story: tension, rhythm, restraint.",
    "Japan taught me how little you actually need, and how much silence can hold.",
    "Everything since has been the same instinct working itself out in a different medium.",
  ],
  // To use Zubayer's real photo: put it in the "public" folder and change this to "/portrait.jpg"
  portrait: "https://picsum.photos/seed/zubportrait/800/1000",
  disciplineTable: [
    { institution: "Architecture School", credits: "120 credits", location: "Dhaka" },
    { institution: "Film & Media", credits: "48 credits", location: "Tokyo" },
    { institution: "Residency", credits: "1 year", location: "Kyoto" },
    { institution: "Independent practice", credits: "Ongoing", location: "Dhaka, present" },
  ],
};

const FOOTER = {
  email: "hello@zubayer.works",
  locationLabel: "Dhaka, Bangladesh",
  footerLine: "Mostly making things. Occasionally on time.",
};

export default async function Home() {
  const [work, gallery, ventures, writing] = await Promise.all([
    getWork(), getGallery(), getVentures(), getWriting(),
  ]);
  return (
    <main>
      <Nav />
      <Opening location={HERO.location} headline={HERO.headline} subText={HERO.subText} />
      <Work items={work} />
      <Archive images={gallery} />
      <About settings={ABOUT} />
      <Ventures ventures={ventures} />
      <Writing posts={writing} />
      <Services />
      <Contact settings={FOOTER} />
    </main>
  );
}
