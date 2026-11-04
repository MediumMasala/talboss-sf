# Assets log (every asset on the site must be listed here with its licence)

## Tal-owned, pulled from tal-boss-web.vercel.app (our India site) on 4 Nov 2026 → `public/india/`
- `people/` aman.png, ananya.png, aryan.png, isha.png, rohan.png (landing cards), sanchit.png, souvik.png (onboarding sample profiles), sunny-shah.png (Tal Select testimonial, Tech Lead, Sarvam AI). Real Tal people/users as used on our own site. Use as our own; do not present as "Tal Select members in SF" or invent quotes for them.
- `companies/` adobe, airbnb, amazon, apple, databricks, de-shaw, google, meta, microsoft, nvidia, razorpay, salesforce, spotify, stripe, uber, whatsapp, xai (svg). Logos of companies whose bosses hire on Tal (India). Same honesty rule as before: "Bosses from these companies hire on Tal".
- `fonts/` sf_pro_display_{regular,medium,semibold,bold}.woff2 (SF Pro Display: Apple's font; the India site self-hosts it. Legally safer to use `-apple-system` on Apple devices and a licensed/Google fallback elsewhere; do not ship SF Pro to non-Apple devices in production), scotch_deck_compressed.woff2 (Scotch Deck: check licence before shipping; used on the India site), three unnamed woff2 (83afe…, caa3a…, e41d5…: Next-hashed; identify before use).
- `misc/` tal-boss-logo.svg (the logo), laurel.png, 8eeef.png (landing illustration), groww/plum/ola-krutrim/pronto/sarvam/hdfc/kotak marks ("closed for" clients of Tal Select India).

## Licensed / original (add rows as you add assets)
| file | source URL | author | licence | used where |
|---|---|---|---|---|
| `public/photos/window-{wide,tall}-*.{avif,webp}` | https://unsplash.com/photos/person-in-blue-jacket-standing-near-window-UkhecUKFfd0 | Wesley Mc Lachlan | Unsplash Licence (verified on the photo page 4 Nov 2026) | Opening frame (hero), atmosphere only; replaced the train-reader photo, whose book cover was third-party text |
| `public/photos/notebook-*.{avif,webp}` (bottom 58% crop) | https://unsplash.com/photos/black-coffee-in-ceramic-mug-near-black-click-pen-on-top-of-open-notebook-Hy4eZgKCcXI | Brandon Cormier | Unsplash Licence (verified) | What an agent does, pair 1 |
| `public/photos/fog-walk-*.{avif,webp}` | https://unsplash.com/photos/two-people-walking-on-a-bridge-in-the-fog-3r0gAuih0tY | Tatiana Reusche | Unsplash Licence (verified) | What an agent does, pair 2 |
| `public/photos/lamp-*.{avif,webp}` | https://unsplash.com/photos/table-and-chairs-near-a-window-at-night-UAMLs1jkhHY | Amin Zabardast | Unsplash Licence (verified) | What an agent does, pair 3 (the "round the clock" frame) |
| `public/photos/cubbon-*.{avif,webp}` | https://unsplash.com/photos/a-large-tree-sitting-in-the-middle-of-a-lush-green-park-nuIpe_EumH4 | Nithin Purple | Unsplash Licence (verified) | Where we come from (Cubbon Park canopy, Bengaluru) |
| `public/photos/sf-fog-{wide,tall}-*.{avif,webp}` | https://unsplash.com/photos/a-city-with-many-buildings-and-a-sunset-mn89fXEo310 | Zetong Li | Unsplash Licence (verified) | Done title card, OG image |
| `public/photos/hill-wide-*.{avif,webp}` (26 to 62% band) | https://unsplash.com/photos/silhouette-of-trees-and-mountain-during-golden-hour-OopzSWabsWE | Casey Horner | Unsplash Licence (verified) | End credits frame |
| `scripts/photo-src/*.jpg` | the same seven photos, fetched from images.unsplash.com at 2600 px | as above | Unsplash Licence | build inputs only, not served |
| `scripts/tal-grade.cube`, `scripts/grade-photos.mjs` | original | Tal frontend | original work | the one grade baked into every photograph above (lifted moss blacks, warm highlights, greens to olive, skin protected, bottom burn on title frames) |
| `public/photos/grain.png` | original (generated gaussian noise, 160 px tile) | Tal frontend | original work | 35 mm grain overlay on photographs, 5% |
| `public/sound/room.opus` (24 s seamless loop, 42 KB, -24 LUFS) | original (synthesised in Python: FFT pink noise band-limited 70 to 900 Hz, one slow swell per loop, six faint synthetic bird chirps) | Tal frontend | original work | room tone, only after SOUND ON |
| `public/sound/note.opus` (3.6 s, 14 KB, -24 LUFS) | original (additive felt-piano C4: six stretched partials, 12 ms attack, low-passed) | Tal frontend | original work | on "Yes, that's me", only after SOUND ON |
| `public/sound/phrase.opus` (4.6 s, 18 KB, -24 LUFS) | original (felt-piano G3 then D4, 620 ms apart) | Tal frontend | original work | as the done title card appears, only after SOUND ON |
| `public/photos/og.jpg` (1200 x 630) | derived from the graded `window` frame above | Wesley Mc Lachlan (Unsplash) | Unsplash Licence | background of the static OG card `app/opengraph-image.jpg` (rendered once in Chrome with Libre Caslon Display; the copy is `select.og`) |
| `public/photos/people/*.webp` (240 x 300) | derived from `public/india/people/*.png`, put through the same grade | Tal | Tal-owned | the Bengaluru contact sheet |
| `public/sound/{room,note,phrase}.m4a` | AAC-LC 20 kbps re-encodes of the three original Opus files above (room 62 KB) | Tal frontend | original work | fallback for browsers without Ogg Opus; loaded only after SOUND ON |
| Libre Caslon Text italic (via `next/font/google`) | https://fonts.google.com/specimen/Libre+Caslon+Text | Impallari Type | SIL Open Font Licence | names only (the live name, the casting card, signatures, the title card); Display has no italic |
| Libre Caslon Display (via `next/font/google`) | https://fonts.google.com/specimen/Libre+Caslon+Display | Impallari Type | SIL Open Font Licence | display serif |
| IBM Plex Mono (via `next/font/google`) | https://fonts.google.com/specimen/IBM+Plex+Mono | IBM | SIL Open Font Licence | mono credits and labels |
| Inter (via `next/font/google`) | https://fonts.google.com/specimen/Inter | Rasmus Andersson | SIL Open Font Licence | text fallback after the system UI stack |
| `public/india/people/{aman,ananya,aryan,isha,rohan,sanchit,souvik,sunny-shah}.png` | tal-boss-web.vercel.app (Tal-owned, see top of file) | Tal | Tal-owned | the Bengaluru contact sheet only, captioned "People on Tal in Bengaluru", no quotes |
| `public/brands/{google,uber,salesforce,adobe,linkedin,paypal,intuit}.svg` (okta, ebay, nvidia, stripe, databricks deleted 4 Nov: unverified), `public/india/companies/{microsoft,amazon,spotify,razorpay}.svg`, `public/india/misc/sarvam.svg` | company marks (trademarks of their owners), from the repo and our India site | the companies | nominative use, founder-verified 4 Nov 2026: bosses from these companies have accounts on Tal | one quiet monochrome row in "Where we come from", captioned with the copy key |

Rules: Unsplash Licence, Pexels Licence, CC0 or original only. No film stills, posters or any A24 material. No stock "diverse office" clichés.

Download note: Unsplash's `/download?force=true` endpoint sits behind a bot check from curl, so the files were fetched from the photo's own images.unsplash.com URL (the same original, same licence). The Unsplash Licence doesn't require attribution; we credit every photographer by name in the end credits anyway.

Removed 4 Nov (Steve round 1): the train-reader hero (patsanannnn; third-party book cover in frame) and the Golden Gate Park canopy (Anthony Sebbo; one canopy photo only). Neither is on the site or in the repo.

## Round 3 (original, generated)

Founder brief 4 Nov: bright, optimistic, "a world of opportunities ahead", clean Western-startup imagery; black, white, silver; no people, text or logos. Generated with `gemini-3.1-flash-image` via `scripts/art/gen.mjs` (OpenAI key still 401, not used), neutralised to greyscale. Prompts: `docs/team/art/round3/PROMPTS.md`; contact sheet: `docs/team/art/round3/sheet.jpg`. Candidates only; nothing is served from `public/` yet.

| file | source | author | licence | grade | used where |
|---|---|---|---|---|---|
| `docs/team/art/round3/horizon-dawn-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/horizon-dawn-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/horizon-dawn-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/horizon-dawn-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | PICK: done screen |
| `docs/team/art/round3/glass-tower-light-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/glass-tower-light-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/glass-tower-light-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/glass-tower-light-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/chrome-orb-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/chrome-orb-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/chrome-orb-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/chrome-orb-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/aperture-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/aperture-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/aperture-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/aperture-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/particle-horizon-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | PICK: hero (desktop) |
| `docs/team/art/round3/particle-horizon-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | PICK: hero (mobile) |
| `docs/team/art/round3/particle-horizon-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/particle-horizon-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/silk-light-a-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/silk-light-a-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | white page | candidate |
| `docs/team/art/round3/silk-light-b-16x9.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/silk-light-b-4x5.png` | generated, gemini-3.1-flash-image, prompt in PROMPTS.md | Tal (AI-generated, original) | original work | dark page | candidate |
| `docs/team/art/round3/og-a-1200x630.jpg` | derived from `particle-horizon-a-16x9.png` (centre crop) | Tal (AI-generated, original) | original work | dark | OG candidate |
| `docs/team/art/round3/og-b-1200x630.jpg` | derived from `particle-horizon-a-16x9.png` (1.25x push-in) | Tal (AI-generated, original) | original work | dark | PICK: OG image |

## Served by the v4.1 site (frontend, 5 Nov 2026)
The v3 photographs (`public/photos/`), sound (`public/sound/`), the self-hosted SF Pro / Scotch Deck fonts (`public/india/fonts/`), the photo grade scripts and their Unsplash sources were deleted. No stock photography, no photographer credits, no serif.

| file | source | licence | used where |
|---|---|---|---|
| `public/art/hero-16x9-{640,1024,1376}.{avif,webp}`, `hero-4x5-{480,768,928}.*` | round 3 `particle-horizon-a-*` (greyscale, `scripts/art.mjs`) | original (AI-generated) | landing hero |
| `public/art/done-4x5-{480,720,928}.*` | round 3 `horizon-dawn-b-4x5` | original (AI-generated) | A7 Done |
| `public/art/orb-4x5-{480,720,928}.*` | round 3 `chrome-orb-b-4x5` | original (AI-generated) | The deal card (desktop) |
| `public/art/grain.png` (160 px RGBA noise tile) | generated in node (seeded LCG) | original | hero film grain |
| `app/opengraph-image.jpg` | round 3 `og-b-1200x630` + the tal wordmark in the silver ramp (`scripts/og.mjs`) | original + Tal mark | social card |
| `public/ds/{tal-logo,chevron-left,magnifier,file-upload,mock-highlight}.svg` | exported from Figma QjHT7mWSNvgeAuiQehZZNJ (Boss DS library: tal logo v2, Anron icons) | Tal-owned | logo tile, wordmark mask, Back, LinkedIn visual, resume drop, product mock |
| `public/logos/*.svg` (12) | white vectors from Figma DS/Logo Marquee Row 18:1395 (made from the repo SVGs) | trademarks of their owners, nominative use, founder-verified 4 Nov 2026 | logo marquee, captioned "Bosses from these companies hire on Tal" |
| Inter (via `next/font/google`, not preloaded) | Google Fonts | SIL OFL | text fallback after the system stack |
