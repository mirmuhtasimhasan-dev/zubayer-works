# Zubayer Ahmed — Portfolio & Digital Archive

A narrative-driven portfolio site for **Zubayer Ahmed**, a filmmaker, brand consultant and entrepreneur based in Dhaka, Bangladesh. The site presents his visual work, ventures and writing as a single connected archive rather than a conventional project grid.

**Live site → [zubayer.life](https://zubayer.life)**

> *"Some people choose a lane. I chose a problem."*

---

## Overview

Most creative portfolios are a wall of thumbnails. The brief here was different: Zubayer works across documentary film, photography, brand consulting and product ventures, and the site needed to hold all of that without feeling scattered.

The solution was to organise the work by intent instead of by medium — what the work is *for*, not what format it happens to be in. Content is managed through a headless CMS so new films, photo series and essays can be published without a code deploy.

## Features

- **The Eye** — documentary films, cinematic advertising, poetry and a thematically organised photography archive
- **The Ventures** — case pages for Jadughor, Loadshedding.mov and Motobuddy
- **Writing** — essays surfaced from the *Scrappy Scribbles* publication
- **Engagements** — services covering documentary work, story-led advertising, brand development, creative direction, photography and research
- Fully content-managed through Sanity Studio — no redeploy needed to publish
- Responsive across mobile, tablet and desktop
- Optimised images and fonts, server-rendered for fast first paint and SEO

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS | Sanity |
| Hosting | Vercel |
| Tooling | ESLint, PostCSS |

## Project Structure

```
├── app/          # Routes, layouts and pages (App Router)
├── components/   # Reusable UI components
├── data/         # Static content and configuration
├── lib/          # Utilities and helpers
├── sanity/       # Sanity schemas, client and queries
└── public/       # Static assets
```

## Getting Started

**Requirements:** Node.js 18 or later.

```bash
# 1. Clone the repository
git clone https://github.com/mirmuhtasimhasan-dev/zubayer-works.git
cd zubayer-works

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env.example .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
```

### Content Management

Sanity Studio runs alongside the site at [http://localhost:3000/studio](http://localhost:3000/studio). Schemas live in `sanity/` — edit them there and the Studio interface updates automatically.

## Deployment

Deployed on Vercel with automatic builds on every push to `main`. To deploy your own instance, import the repository into Vercel and add the environment variables listed above.

```bash
npm run build   # production build
npm run start   # serve the production build locally
```

## Design Notes

- **Typography-first.** For a client whose work is about story, the type carries the hierarchy rather than heavy UI chrome.
- **Restrained motion.** Transitions are used to connect sections, not to decorate them.
- **Content modelled around meaning.** Sanity schemas mirror how Zubayer actually thinks about his work — eye, ventures, writing, engagements — so publishing feels natural instead of like filling in a form.

## Author

Built by **Mir Muhtasim Hasan**

[GitHub](https://github.com/mirmuhtasimhasan-dev)

---

© Zubayer Ahmed. All rights reserved. Code available for reference; content and imagery are not licensed for reuse.
