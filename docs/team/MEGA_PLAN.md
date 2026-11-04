# MEGA PLAN: Tal US, v4 (4 Nov 2026)

## Why v3 failed (so v4 doesn't)
We designed in code, against taste we invented (Caslon, moss, Unsplash), instead of against the Tal Web Design System the founder already built. The result read as a stock-photo template with AI-sounding copy. The founder's verdict: "a first copy of all the websites you saw"; photos, fonts and colours wrong; the garden and random photos, the logo row, the Unsplash credits and the letter/pitch bit all cut; "Tell us your name and where you work…" is not understandable; Tal is never "he".

## The system we build in (from the Figma file UzuMTGlnXwYMDTxlnSyfmT)
- Cover line: **"Black & white · Inter · Airbnb-derived geometry and elevation · Boss web."**
- Canvas: true black and white. Metallic silver gradient on the "tal" wordmark (Sub-brand board: embossed metal card, barcode, diamond). Greys as a 4-step silver ramp.
- Type: Inter everywhere (Display for headlines at tight tracking, Medium for UI). The Select sub-brand board allows a classic serif *only* as a poster accent ("Handpicked / Curated / Top Talent"), with a red "stamp" sticker.
- Elements: white pill buttons (black text) on dark; black pill buttons on white; glass cards (dark translucent, 1px hairline, soft elevation); chat-thread cards as proof; stamp/sticker accents; stat blocks with thin dividers; segmented progress bar at the bottom of onboarding; "Questions?" / "Save & exit" pills top-right; the small rounded "tal" app-icon mark.
- Onboarding pattern (web onboarding · boss, A1–A6): one question per screen, centred, giant input, black pill "Continue", "or press ↵ to continue", "Finding you on LinkedIn" with the LinkedIn icon, honest % bar and "This might take a minute, hang tight".
- Landing pattern (tal select – landing v2): black hero with a centred headline and pill CTA, a glass chat card, a logo marquee, a white rounded card with phone mockups and four stats, a numbered "You meet great talent, we do the rest" section, a video card, and the giant metallic wordmark in the footer.

## The one idea for v4
**Talent, in black and white.** The site is a dark, metallic Tal page with one living layer of AI-generated art-house stills (monochrome, grain, silver light, no people, no text) that give it the A24 soul the founder asked for, inside the system's geometry. The flow is the India onboarding pattern, one question at a time, ending on your name and "Represented by Tal · until <date>" set in Inter over a generated still.

## Phases, owners, gates

### Phase 0 · Foundations (orchestrator, today)
- Token sheet from the DS: colours, silver ramp, radii, elevation, Inter scale, button specs, input specs, progress bar, card specs. Source: `get_design_context` on DS components (works on the view-only file) + screenshots in `/tmp/.../ds/`.
- Art pipeline: `gemini-3.1-flash-image` with our key (tested, 11 s/image, original work, no credits needed). Prompt bible in `docs/team/ART.md`; 16:9 and 4:5 variants; grain baked.
- Figma workspace: a new file "Tal US · v4" in the Grapevine drafts (create_new_file), DS components imported by key. If the DS file is editable for us, a new page in it instead.
- **Gate:** none; this unblocks everything.

### Phase 1 · Figma screens and flows, max precision (designer agent + orchestrator)
Build every screen at 1440 and 390, from DS components, pixel-exact:
1. Landing: hero (generated still + "Talent" headline in Inter Display + pill CTA), how it works (numbered, DS style), proof (network numbers; logo marquee of the 12 verified companies in DS style, caption honest), the terms as a short card, questions, footer with the giant metallic "tal".
2. Flow: Name → Company → Title (one per screen), Finding you on LinkedIn, Is this you? (DS profile card, Yes / No / Paste link), Resume (optional; "Skip" quiet), Done (your name + "Represented by Tal · until <date>").
3. States: not found, rate-limited, daily cap, no-resume email, errors.
4. Prototype wiring so the founder can click through.
- **Gate (founder):** the founder reviews in Figma and signs off. No code before this.

### Phase 2 · Art (orchestrator + art agent)
- 24 generated candidates across 6 motifs (window light, fog hill, lamp at night, train window, empty chair, city at dawn), black-and-white with silver highlights; pick 6; grade once; AVIF/WebP at 3 sizes; OG image. Logged in ASSETS.md as original.
- **Gate (founder):** picks the hero still from the contact sheet.

### Phase 3 · Copy (new copywriter, with the DS voice)
- Short, plain, one line per screen: "What's your full name?", "Where do you work?", "What's your title?", "Finding you on LinkedIn", "Is this you?", "Add your resume (optional)", "You're represented." The landing copy is fact-first like the India Select page ("Closing roles for 200+ companies" style), not literary. No letter, no pitch, no "we'd introduce you". Tal is Tal/it. Claims unchanged (300,000+, 5,000+, Peak XV line, SF/Bay Area/remote, six months, free, ask-first).
- **Gate:** reads in the founder's voice test; no banned patterns.

### Phase 4 · Backend (existing engineer, small)
- Remove `/api/pitch` from the flow (keep the code dormant or delete), drop `pitch`/`pitchSource` from the upload payload, keep lookup, limits, optional resume, photo proxy. Add nothing.
- **Gate:** tsc clean; curl recipes pass.

### Phase 5 · Frontend (a new "magical" engineer)
- Mandatory study before code, with notes: Motion (motion.dev / framer-motion 12) layout + shared-element transitions; GSAP ScrollTrigger + Flip; Lenis smooth scroll; SplitType/text reveal; the View Transitions API; a canvas grain shader; Rive or Lottie only if a hand-made asset is worth it; no Three.js unless the hero demands it. Sites to use, not read: linear.app, vercel.com, apple.com product pages, stripe.com, lusion.co, jackandjill.ai, meetdex.ai, why.zero.university, our India site's toggle.
- Build pixel-exact to Figma (get_design_context per frame), with DS tokens as CSS variables; one-question-per-screen transitions as shared-element moves (the typed name travels from the input into the next screen's heading); honest progress; the Done card dissolve.
- Budgets: Lighthouse ≥ 95 mobile on the production build, LCP ≤ 2.0 s, CLS 0, 390 px clean, reduced motion, keyboard.
- **Gate:** screenshot diff against Figma within tolerance; fresh contact sheets.

### Phase 6 · Steve (founder's persona), bound to the system
- Judges fidelity to Figma first, then the one test: would an Anthropic/OpenAI engineer in SF say "wow, I should try this?" Reads every line aloud. PASS required before the founder sees it.

### Phase 7 · Ship
- Push (needs write access), `wrangler secret put APIFY_TOKEN GEMINI_API_KEY`, `npm run db:migrate`, `npm run deploy`, Lighthouse on prod, Mixpanel wired, US privacy policy.

## What's cut, permanently
The letter/pitch step and "how we'd introduce you"; the sharpen question; stock photography and photographer credits; the contact sheet of Bengaluru faces; serif body or display outside a poster accent; any copy that explains the product in a paragraph on a form.

## Open for the founder
1. Figma: do we have edit rights on the DS file, or should v4 live in a new file in drafts? (Probe running.)
2. Pick the hero still from the first art contact sheet.
