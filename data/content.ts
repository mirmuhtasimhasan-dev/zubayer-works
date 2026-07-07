export const settings = {
  locationLabel: "Dhaka, Bangladesh — Filmmaker & Brand Consultant",
  headline: "Some people choose a lane. I chose a problem.",
  subText: "I make films, build brands, and start companies. Trained in architecture, shaped by media, sharpened in Japan.",
  aboutTitle: "A Crooked Line, Drawn Deliberately",
  aboutIntro: "I never picked one thing. I picked one question and followed it across disciplines.",
  aboutBody: [
    "I started in architecture, learning how structure carries meaning before a single word is spoken.",
    "Then media pulled me in, and I found the same rules applied to story: tension, rhythm, restraint.",
    "Japan taught me how little you actually need, and how much silence can hold.",
    "Everything since has been the same instinct working itself out in a different medium.",
  ],
  portrait: "https://picsum.photos/seed/zubportrait/800/1000",
  disciplineTable: [
    { institution: "Architecture School", credits: "120 credits", location: "Dhaka" },
    { institution: "Film & Media", credits: "48 credits", location: "Tokyo" },
    { institution: "Residency", credits: "1 year", location: "Kyoto" },
    { institution: "Independent practice", credits: "Ongoing", location: "Dhaka, present" },
  ],
  email: "hello@zubayer.works",
  footerLine: "Mostly making things. Occasionally on time.",
};

// The Eye — each item is a PROJECT. Click a photo project -> its gallery. Click a film -> its video.
export const work = [
  {
    id: "w1", slug: "furs-and-feathers", type: "photo",
    title: "Furs and Feathers", category: "Photography", format: "wide",
    cover: "https://picsum.photos/seed/furs/1400/700",
    description: "A quiet study in texture and stillness, shot over two early mornings.",
    images: [
      "https://picsum.photos/seed/furs1/1200/1500",
      "https://picsum.photos/seed/furs2/1200/850",
      "https://picsum.photos/seed/furs3/1200/1500",
      "https://picsum.photos/seed/furs4/1200/900",
      "https://picsum.photos/seed/furs5/1200/1200",
      "https://picsum.photos/seed/furs6/1200/850",
    ],
  },
  {
    id: "w2", slug: "shunno-art-cafe", type: "video",
    title: "Shunno Art Café", category: "Commercial", format: "half",
    cover: "https://picsum.photos/seed/shunno/900/700",
    description: "A brand film for a café that treats coffee like craft.",
    videoEmbed: "https://www.youtube.com/embed/VIDEO_ID",
  },
  {
    id: "w3", slug: "bulb", type: "photo",
    title: "bulb.", category: "Photography", format: "half",
    cover: "https://picsum.photos/seed/bulb/900/700",
    description: "Light as the subject, not just the tool.",
    images: [
      "https://picsum.photos/seed/bulb1/1200/900",
      "https://picsum.photos/seed/bulb2/1200/1400",
      "https://picsum.photos/seed/bulb3/1200/900",
      "https://picsum.photos/seed/bulb4/1200/1200",
      "https://picsum.photos/seed/bulb5/1200/800",
    ],
  },
  {
    id: "w4", slug: "amreen-jewelry", type: "video",
    title: "Amreen Jewelry", category: "Commercial", format: "wide",
    cover: "https://picsum.photos/seed/amreen/1400/700",
    description: "A jewelry campaign built around light, hands, and heirloom.",
    videoEmbed: "https://www.youtube.com/embed/VIDEO_ID",
  },
  {
    id: "w5", slug: "someflowers", type: "photo",
    title: "Someflowers", category: "Photography", format: "half",
    cover: "https://picsum.photos/seed/flowers/900/700",
    description: "A short series on colour and decay.",
    images: [
      "https://picsum.photos/seed/flo1/1200/1500",
      "https://picsum.photos/seed/flo2/1200/900",
      "https://picsum.photos/seed/flo3/1200/1200",
      "https://picsum.photos/seed/flo4/1200/850",
      "https://picsum.photos/seed/flo5/1200/1400",
      "https://picsum.photos/seed/flo6/1200/900",
    ],
  },
  {
    id: "w6", slug: "19th-december-dhaka", type: "video",
    title: "19th December, Dhaka", category: "Documentary", format: "half",
    cover: "https://picsum.photos/seed/dhaka/900/700",
    description: "A documentary short on a single day in the city.",
    videoEmbed: "https://www.youtube.com/embed/VIDEO_ID",
  },
];
// Films: replace VIDEO_ID with a real YouTube/Vimeo embed id. Photos: swap in real project images.

export const gallery = Array.from({ length: 12 }).map((_, i) => ({
  id: `g${i}`,
  caption: `Frame ${String(i + 1).padStart(2, "0")}`,
  src: `https://picsum.photos/seed/arc${i}/700/${800 + (i % 4) * 120}`,
}));

export const ventures = [
  { id: "v1", name: "Jadughor", tagline: "The magic-house for stories", description: "A platform turning local narratives into shareable film, built to scale across Bangla audiences.", inquiryEmail: "hello@zubayer.works" },
  { id: "v2", name: "Motobuddy", tagline: "Your ride, sorted", description: "A mobility venture solving everyday transport friction with a product-first approach.", inquiryEmail: "hello@zubayer.works" },
];

export const writing = [
  {
    id: "p1", slug: "on-craft", title: "On Craft: The Discipline of Showing Up",
    category: "Essay", date: "2024-05-12",
    excerpt: "The work that lasts is rarely the work that felt inspired.",
    cover: "https://picsum.photos/seed/blog1/1200/675",
    body: [
      "The work that lasts is rarely the work that felt inspired. It is the work you returned to on the ordinary days, when nothing in you wanted to.",
      "I used to wait for the right mood. Then I noticed the people I admired were not waiting for anything. They simply showed up, and the mood arrived, if it arrived at all, somewhere in the middle.",
    ],
  },
  {
    id: "p2", slug: "building-in-public", title: "Building in Public, Failing in Private",
    category: "Essay", date: "2024-04-03",
    excerpt: "Everyone shares the launch. Almost no one shares the six quiet months before it.",
    cover: "https://picsum.photos/seed/blog2/1200/675",
    body: [
      "Everyone shares the launch. Almost no one shares the six quiet months before it, which is where the real story lives.",
      "Failing in private is a privilege and a trap. You learn, but no one keeps you honest. So I write it down instead.",
    ],
  },
  {
    id: "p3", slug: "train-to-nowhere", title: "Notes from a train to nowhere",
    category: "Journal", date: "2024-05-08",
    excerpt: "Movement without a destination is underrated. So is silence.",
    cover: null,
    body: [
      "Movement without a destination is underrated. So is silence.",
      "I got on the train with no plan and got off three stops later with a whole one. That is usually how it goes.",
    ],
  },
];
