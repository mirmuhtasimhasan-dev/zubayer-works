import type { ReactNode } from "react";

// Edit service copy here. Each one gets a card on the home page and its own
// /services/[slug] page (description + a contact block).
export interface Service {
  slug: string;
  title: string;
  blurb: string; // short line on the home card
  description: string[]; // paragraphs on the detail page
  cta: string; // line above the email on the detail page
  icon: ReactNode;
}

export const SERVICES_EMAIL = "hello@zubayer.works";

export const SERVICES: Service[] = [
  {
    slug: "documentary-filmmaking",
    title: "Documentary Filmmaking",
    blurb: "Long-form stories, shot and cut with intent.",
    description: [
      "Documentaries live or die on trust. I take the time it needs to earn it — staying with people until the real story surfaces, then shaping it into something that holds an audience from the first frame to the last.",
      "From a single portrait to a multi-part series, the work spans research, direction, cinematography and edit — one hand guiding the story so the tone never breaks.",
    ],
    cta: "Have a story worth telling properly? Tell me about it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="10" rx="1.5" />
        <path d="M16 10l5-3v10l-5-3z" />
      </svg>
    ),
  },
  {
    slug: "story-based-advertising",
    title: "Story-Based Advertising",
    blurb: "Brand films that make people feel before they buy.",
    description: [
      "The best brand films don't sell — they make you feel something, and the buying takes care of itself. I build ads around a story first, so the product lands as the payoff, not the pitch.",
      "Concept, script, direction and post — delivered as a film people actually want to watch and pass along.",
    ],
    cta: "Want an ad that doesn't feel like one? Let's make it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.4l6 3.6-6 3.6z" />
      </svg>
    ),
  },
  {
    slug: "brand-development-consultancy",
    title: "Brand Development & Consultancy",
    blurb: "Positioning, identity, and the strategy underneath.",
    description: [
      "A brand is a decision about who you are long before it's a logo. I help founders find that decision — the position, the voice, the reason to care — then translate it into an identity that behaves consistently everywhere.",
      "Strategy, naming, visual direction and the guidelines to keep it coherent as you grow.",
    ],
    cta: "Building something that needs a spine? Let's shape it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.6 8.4l-2.3 4.9-4.9 2.3 2.3-4.9z" />
      </svg>
    ),
  },
];
