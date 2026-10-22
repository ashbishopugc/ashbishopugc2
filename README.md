# ashbishopugc2: "Ash Bishop, Limited Edition"

Design concept 2 for Ash Bishop's (PressStartAsh) UGC portfolio. It's built from the PRD as a one-page retro video game: each section is a **level**, and an 8-bit 4x4 drives a pixel trail from Florida to Tennessee along the bottom of the screen as you scroll.

Astro (static output), plain CSS and a small vanilla TypeScript file. Fonts are self-hosted. No UI framework.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the built site
npm run check     # type-check
```

## Deploy (Vercel)

Import this repo in Vercel (**Add New → Project → ashbishopugc2**). Vercel detects Astro automatically. The build command is `npm run build` and the output directory is `dist`. Every push to `main` redeploys.

## Edit the content

**All text, stats, videos, brands and testimonials live in one file: `src/content/site.json`.** You can change it without touching the layout.

| What | Where in `site.json` |
| --- | --- |
| Name, niche, location, email, socials | top level |
| Form service URL | `formEndpoint` (see below) |
| Hero reel | `hero.reel` (MP4), `hero.reelWebm`, `hero.reelPoster`, `hero.reelCaptions` (.vtt) |
| Photos | `about.photo`, `about.polaroid` (+ alt text and captions) |
| Bio and personality chips | `about.bio`, `about.chips` (icons: controller, box, house, calendar, pin, coffee) |
| High scores | `stats.rows` (each row links to a video by `id`). Set `stats.sampleNote` to `""` when the numbers are real |
| Portfolio videos | `work.videos`: `video` (MP4), `videoWebm`, `preview` (short muted clip for hover), `poster`, `captions` |
| Brands and testimonials | `brands.rowOne`, `brands.rowTwo`, `brands.testimonials` |
| Process turnaround | `process.steps[].time`, e.g. `"2-3 days"` |
| Konami easter egg | `easterEgg` (add a `blooper` video to play one) |

Put media files in `public/media/` and reference them as `/media/file.mp4`. Keep videos as vertical H.264 MP4s. Hover previews should be 4MB or less. Posters should be WebP or AVIF.

**Sections show only when they have real content.** Results (High Scores) appears once `stats.rows` has entries, and Brands appears once `brands.rowOne`, `brands.rowTwo` or `brands.testimonials` does. The menu, scroll track and level numbers adjust on their own. Work filters list only categories that have a video. Example entries:

```json
"rows": [{ "video": "logitech-a50", "label": "Astro A50 headset", "views": 12000, "likes": 900, "comments": 40, "shares": 25, "saves": 60 }]
"testimonials": [{ "quote": "…", "brand": "Brand name", "role": "Their job title" }]
```

Placeholders show a "sample" tag. These tags disappear when you replace the sample brands, add real videos or clear `stats.sampleNote`.

## Contact form

The form posts JSON to `formEndpoint` and includes a `_gotcha` honeypot.

1. Create a free form at [formspree.io](https://formspree.io) using Ash's email.
2. Paste its URL (`https://formspree.io/f/xxxxxxx`) into `formEndpoint`.

Until you do this, submitting the form opens the visitor's email app with the message already filled in.

## Where things live

| File | What |
| --- | --- |
| `src/content/site.json` | All content |
| `src/styles/global.css` | Colour tokens (light/dark), type, tri-stripe, frames, buttons |
| `src/lib/sprites.ts` | Pixel art (4x4, palm, hills, house, icons) as editable character grids |
| `src/components/*.astro` | One file per section, plus `Track` (scroll trail) and `Lightbox` |
| `src/scripts/main.ts` | Menu, theme, scroll track, reveals, count-up, filters, lightbox, carousel, form, Konami |

## Notes against the PRD

- Brand teal, red and gold are too light for AA text on cream. Light mode adds darker text-only siblings (`--gold-text`, `--red-text`, `--focus`), and the brand colours stay for stripes and decoration.
- Lighthouse mobile (local build): Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Reduced motion: the truck jumps between stops, and the rewind intro, carousel auto-advance, marquee and count-ups are switched off.
