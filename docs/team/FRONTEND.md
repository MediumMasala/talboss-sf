# Frontend (v4.2, 5 Nov 2026)

The Tal US site, built to the Figma file **Tal US · v4** (`QjHT7mWSNvgeAuiQehZZNJ`) in the Tal Web Design System: black and white, the system font with Inter as the fallback, pill buttons, glass cards, one question per screen. The study behind the motion choices, with measured timings from J&J, Dex, Zero, Linear, Vercel, Stripe, Lusion and our India site, is `FRONTEND_STUDY.md`.

## Run it
```bash
npx next dev -p 3217                                   # http://localhost:3217
npm run build && npx next start -p 3218                # production build
./scripts/shots.sh                                     # every screen at 1440 and 390 → docs/team/shots-v4/ (needs dev on 3217)
node scripts/art.mjs && node scripts/og.mjs            # art → public/art (AVIF + WebP, 3 widths); OG card
```
npm always with `--cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache`.

## Architecture
```
app/
  layout.tsx            fonts (Inter via next/font, not preloaded), metadata. No providers: the landing ships no animation library.
  globals.css           DS tokens (surface/000…1100, glass, hairline, metal), type classes, pills, glass + glow, grain,
                        wordmark + sheen, marquee, hero entrance, caret, reduced-motion overrides
  page.tsx              the landing, server component; client islands only where something moves
  start/page.tsx        the flow
  preview/page.tsx      dev-only contact sheet (404 in production)
components/
  ds/                   LogoTile, TalAvatar, Magnetic, Wordmark, HeroField, Progress, useGlow
  landing/              RaisedBar, Nav, Hero (+ Landmarks), Marquee, Chat, BehindTal (the numbers wall, + CountUp), How, Deal, Faq, Footer,
                        StartLink (CTA + wipe), SmoothScroll (Lenis), LandingView (analytics), useSeen
  flow/                 Flow (state machine + screens), Done, ProfileCard, LinkedInVisual, api (fetch + honest progress),
                        motion (shared transitions), mock (preview data)
content/site.ts         every word (components read only from here)
content/network.ts      the numbers wall's per-function figures: reads content/network.json (data lane) or, until it
                        exists, content/network.placeholder.json (every value "—"); only clean rounded figures render.
                        Read at render: live in dev; in production "/" is static, so a new network.json needs a rebuild.
lib/analytics.ts        track(): no-op, logs in dev
```
**Dependencies added:** `lenis` only. `framer-motion` (already there) is used **only by the flow** (`LazyMotion features={domMax}` inside `Flow`, synchronous, because a `layoutId` node only gets a projection if the feature is loaded when it mounts). The landing is CSS transitions, CSS scroll-driven animations and ~1 KB of vanilla pointer code. That is what got Lighthouse desktop from 77 to 100 and mobile to 96–97.

**State (flow):** one `useReducer` in `Flow.tsx` (steps `name → company → title → search → confirm → resume | email → done`, plus `link`, `notFound`, `rateLimited`, `dailyCap`, `searchDown`, `offline`). LinkedIn `status` is `confirmed` (Yes on A5), `typed` (only a link that passed `LINKEDIN_RE`, from Continue or left in the field at Skip) or `skipped`; an invalid link is never sent as `linkedinUrl`, and A6's "We'll work from your LinkedIn" shows only for confirmed/typed. **No email never reaches A7:** when `/api/upload` answers `email: null` for a resume, the flow goes to A6b (`needEmail`, sub "Your resume is saved, but there's no email on it…", no "Add a resume instead"), and Continue sends the same resume again with the typed address. That makes a second row; the first has no email (backend: an "attach email to submission" route would remove the duplicate). A `history` stack drives Back (the transient `search` step is skipped). The lookup follows `LOOKUP_PREFETCH.md` (v4.2 §10, see **LinkedIn prefetch sequence** below): `POST /api/linkedin/start` at A2 (prefetch) and again at A3 (attach), poll `GET /api/linkedin/poll` (first poll at once, then every 150 ms; each poll holds ≤ 5 s on the server; always the latest token; give up at 120 s), `POST /api/linkedin/profile` for "No, not me", branch on `code` (429 `rate_limited` / `daily_cap` with `Retry-After`, 502 search down, 503/no network offline). Upload is the v4 seven-field payload (no pitch, no work authorization); the confirmed profile goes with its signed photo link (the backend keeps the LinkedIn URL behind it).

## LinkedIn prefetch sequence (v4.2 §10, `components/flow/Flow.tsx`)
1. **A2 submit** (`submitCompany`, after it validates; not in preview): `key = "name|company"` lower-cased. If `prefetch.current?.key !== key`, fire `start {name, company, partial: true}` (no role) and keep the promise in the `prefetch` ref. Never polled, nothing from it is shown, errors included. Back from A3 to A2 with a **changed** name or company fires a new prefetch on the next A2 submit (new key); the old one is dropped. The same pair again fires nothing.
2. **A3 submit** (`lookup` → `begin(body, true)`): the search screen goes up at once, then the flow **awaits** the prefetch (if its key still matches) and calls `start {name, company, role, partial: true, token}` with the prefetch's token when it answered `pending`. A failed prefetch (429/502/400) is dropped and the start goes without a token; its own reply is the error shown. Retries from the rate-limit/offline screens go through the same path. The paste-link start (`body.url`) is unchanged: no prefetch, no `partial`.
3. **Poll** with `FIRST_POLL_MS = 0`, `POLL_MS = 150`. A held poll can answer up to ~5 s later, so every reply (and every start reply) is dropped if a newer lookup began or the person left A4 (`lookupGen` ref + the latest state in `latest`). Stage index keeps `Math.max`. On `found`: the bar sits at 100 % with "Checking it's you…" for 450 ms, then A5.
4. **Partial cards** (`found` with `partial: true` + `token`): A5 shows the search-data card (initials tile; two pulsing skeleton rows where the roles go, `ProfileCard filling`) and keeps polling in the background with `reply.token` (`s.bg`). Same slug with `partial: false` → `fill`: `s.profile` is replaced in place (the photo fades in over the initials, the rows cascade in), polling stops. `retracted` (or `not_found`, or `found` for another slug) → `retract`: the card comes down, a "Yes" is undone (status back to `skipped`, history cut back to before A5), then A4 with the new token, the new card, or not-found.
5. **"Yes" on a partial card** confirms at once; the background poll runs on for 8 s (`FILL_AFTER_YES_MS`) on A6/A6b so the full card can still replace it, and stops when the upload starts (the partial card is sent as it is). **"No, not me"** posts the latest `next` as usual and stops the background poll. Back stops it too.
6. Analytics: `linkedin_found` now carries `partial`, `src` and `after_title_ms` (`timings.first − timings.attach`); a fill sends `linkedin_found {full_after_partial}`, a retraction `linkedin_failed {reason: "retracted"}`.

**Measured 5 Nov 2026** (local dev, Chrome, the one allowed identity, title typed 6.5 s after A2): A2 prefetch start 2.2 s (dev; paid lanes launched) · A3 start 22 ms (attached with the token) · first poll held 1.87 s and came back `found` (full card, score 0.9, `src: search`, card out 8.2 s after the job started) · **A3 submit → card on screen 2.36 s** (of which 450 ms is the deliberate 100 % beat), A2 → card 8.9 s. Before this change the same lookup was ~16 s from A3. Partial → full, partial → retracted after "Yes", "Not me" on a partial card, and Back-then-change-company (a second prefetch, the A3 start carrying the second token) were checked in the real UI against a stubbed `fetch` (no network). `/start?state=A5partial` previews the partial card.

## Figma → components
| Figma | code |
|---|---|
| DS/Logo Tile 2:63 | `ds/LogoTile` (44.64 / 40 px, radius 12, shadow 0 4 6 @14 %) |
| DS/Header 1440 2:165 · 390 2:208 | header in `Flow` (88 / 64 px; v4.2: no "Questions?" pill; on phones a small Back pill sits on the right once there is history) |
| DS/Footer 1440 2:183 · 390 2:224 | `ds/Progress` + Back pill in `Flow` (desktop footer 88 px; phones: progress under the header, CTA pinned bottom) |
| Input / Hero Field 1:764 | `ds/HeroField` (32/40, 28/34 on phones, DS caret 2 × 36) |
| A1 2:237 / 5:263, A2 2:294 / 5:340, A3 2:344 / 5:395 | `Flow` screens `name`, `company`, `title` |
| A4 2:444 / 5:509 | `search` + `flow/LinkedInVisual` |
| A5 3:275 / 5:571, DS/Profile Card 3:244 | `confirm` + `flow/ProfileCard` |
| A5b Not found 3:448 / 5:663 | `notFound` (and `link`, same layout, title "What's your LinkedIn link?") |
| A5b Rate limited 3:523 / 5:731 | `rateLimited` (Try again with the server's Retry-After countdown) |
| A5b Daily cap 3:592 / 5:793 | `dailyCap` (and `searchDown`, same layout) |
| A6 3:388 / 5:855, A6b 2:394 / 5:451 | `resume`, `email` |
| A7 3:661 / 5:917 | `flow/Done` |
| Landing 4:42 / 5:64 | `app/page.tsx`: RaisedBar 20:964 · Nav 4:46 · Hero 4:43 · Marquee 21:964 (+ DS/Logo Marquee Row 18:1395) · Chat 4:79 · BehindTal 4:123 (v4.2: the numbers wall; the product mock is gone) · How 4:154 · Deal 22:1164 ("What to expect", no orb) · Faq 4:195 · bottom CTA + Footer 4:224 |

Deviations from the frames, on purpose: the quiet answer trail above each question (it is how the typed answer travels, see below); a consent line on A6/A6b (legal); the `offline` and `searchDown` states (not drawn; built in the daily-cap layout); copy where `site.ts` differs from the interim Figma text (site.ts wins); A6's Figma progress showed step 1 (a frame slip), the code shows step 5. Since v4.1 (Steve F11): the **"Tal will write to {email}." line on A7** (not in frame 3:661; it tells you where Tal will reach you, and with no email we now ask on A6b instead of showing it) and the **funding line cut from the footer** (4:224 still draws it; it lives only in the pinned raised bar so the claim appears once). Also v4.1: the A4 stage line under the bar, the A7 role lines, and A6b's "no email on your resume" variant are not drawn yet. Since v4.2 (FEEDBACK_V4_2), not in the frames yet: the numbers wall (replaces 4:124's two stats + mock), the hero's landmark layer and right vignette, the node-map behind the numbers wall, "What to expect" without the orb, the bottom "Apply for Tal" CTA above the footer, the footer's "Questions" link, and the phones' Back pill in the flow header (the Questions? pills are gone from both headers).

## Every animation (timing · easing · property)
Vocabulary (`globals.css` `:root`, `flow/motion.ts`): `--ease-out` `cubic-bezier(0.16,1,0.3,1)` · `--ease-io` `cubic-bezier(0.7,0,0.3,1)` · `--ease-hover` `cubic-bezier(0.25,1,0.5,1)` · spring `travel` (stiffness 260, damping 30, mass 0.9, ≈500 ms) · spring `snap` (420 / 30 / 0.8, ≈350 ms, one small overshoot). Transform and opacity only, except a short blur on entry.

**Landing**
- Hero art (v4.2): the round-5 still `valley-isometric-b` (docs/team/art/round5/PICK.md), same `public/art/hero-*` names. A right-edge vignette on desktop (black → 0 over the right 40 %) softens the flat Pacific plane's hard top edge.
- Landmarks (v4.2, `landing/Landmarks`, server component, CSS only): the verified companies as silver wordmarks at the marquee's optical heights scaled to a 13 px base (12 on phones; Steve r3, so INTUIT no longer outweighs Google), 8 px apart, (logo SVG as a mask over the silver ramp, 62 % opacity, a 3 + 10 px black drop-shadow halo) beside a soft 18 px light on the lit landmark nearest their town, joined by a 14 px hairline. Positions: `docs/team/art/round5/hubs.json` per crop, inside a box with the still's aspect ratio that covers the hero like `object-cover` (`width: max(100cqw, 100cqh × ratio)`, centred), carrying `.hero-img` so it scales with the still. Placement is the founder's list: SF Salesforce, Uber, Microsoft (desktop below-right of the light so it clears the sub line at every width); Mountain View Google, Intuit; Sunnyvale LinkedIn, Amazon; San Jose Adobe, PayPal (a dimmer row 40 px under its light, clear of the wordmark; dropped on phones, where it sits inside the wordmark's lower edge). They light one by one from 0.6 s, 320 ms apart, SF first and down the peninsula (opacity + 3 px + blur 3 → 0, 1 s `--ease-out`; ninth lit by ~4.2 s), then idle: marks pulse 62 % ↔ 42 % on 6 s, lights breathe on 5.6 s. Reduced motion: no animation, all lit.
- Hero art entrance: `scale(1.08) → 1`, 2.4 s, `--ease-out` (CSS, runs before hydration; opacity never animates so the image counts for LCP at once). Grain: a 160 px PNG noise tile at 9 %, stepped on transform, 900 ms `steps(6)` loop. (An SVG feTurbulence grain cost ~700 ms of raster; replaced.)
- Wordmark (hero 160 / 96 px tall, nav, footer): logo SVG as a mask over the silver ramp. Idle sheen: sweep in 1.6 s on the in-out curve every 5.2 s (first at 0.9 s). Pointer (fine pointers): sheen follows the cursor, 600 ms `--ease-out`; tilt up to 7° Y / 5° X, 500 ms; back to idle 1.2 s after the pointer stops.
- Hero copy: logo rises 14 px + blur 6 → 0, 1.2 s at 150 ms; sub, CTA, fine print 0.9 s at 550 / 670 / 750 ms.
- Nav: clear over the hero, wordmark hidden; when the hero logo leaves (IntersectionObserver, 120 px top margin) the bar turns to glass (black 60 % + blur, 300 ms) and the wordmark fades in (opacity + 6 px, 320 ms `--ease-out`).
- Raised bar: sticky top 0, glass 6 % + hairline + blur; wraps after "Peak XV" on phones.
- Marquee: two copies of the row, `translateX(0 → −50%)` 42 s linear, infinite; pauses on hover and focus; edge fades 96→320 px (desktop) and 24→96 px (phones); logos at 40 %, 18 px rows on phones.
- Chat card: starts when 45 % in view. Per Tal message: typing dots (1.2 s loop, 160 ms apart) for its pause (≤ 900 ms), then the bubble lands `y 12 → 0, scale .98 → 1`, 520 ms `--ease-out`; role rows slide in 90 ms apart from 180 ms; your reply after 1.5 s. Pauses are data (`site.select.chat.messages[].after`). All bubbles are laid out from the start (CLS 0). Cursor-following highlight on the glass (`useGlow`, radial 420 px fill + 260 px rim, 300 ms fade).
- The numbers wall (v4.2, `BehindTal`): behind it, full-bleed on the black page, the round-5 node map (`public/art/wall-*`, `valley-nodes-a`) at 18 %, masked to fade at its top and bottom; then the white card, eyebrow "THE PEOPLE BEHIND TAL", the total (`stats.total` = `site.claims.network`) set alone at 112/108 semibold (64/64 on phones) and counting up, the headline finishing the sentence at 40/48, one line, then a grid of DS stats (number 40/48 medium, 28/36 on phones; hairline `s300` above; 13 px label), 2 columns on phones, 3 from 768, 4 from 1024, 5 from 1360 (`.wall-grid`, Steve r3: 10 tiles = two full rows at 1440, no half-empty last row); the last tile (`claims.startups`) spans whatever columns are left so the grid ends flush. Tiles come from `content/network.ts`. Each number counts up from 0 when 80 % in view, 1.6 s easeOutExpo, 60 ms later per tile (a ripple across the grid), tabular figures over an invisible copy of the final value (no width change); decimals and "K+" suffixes count too; a dash never counts. **Checked 5 Nov with the final `network.json`** (9 functions + startups = 10 tiles): 4 + 4 + 2 (last spans 3) at 1440 and 1024, 3 + 3 + 3 + 1 (last spans 3) at 768, 5 × 2 at 390; every row ends flush, no dash, no horizontal scroll. At 390 three labels wrap to two lines at word breaks ("Data engineers, scientists and analysts", "DevOps and platform engineers", "AI and consumer startups"); the numbers stay top-aligned and the row's hairlines stay level. The first two also wrap in the narrower 4- and 3-column tiles at 1024 and 768.
- How it works: a step lights when its top passes 62 % of the viewport and stays lit: hairline fills `scaleX 0 → 1` in white, 700 ms `--ease-io`; number and title 46–50 % → 100 % white (still AA when dim).
- What to expect (v4.2): glass card with the cursor highlight; title left (464 px), four hairline rows right; stacked on phones. No imagery.
- Questions: grid-rows `0fr ↔ 1fr`, 360 ms `--ease-io` (no measuring); answer fades 220 ms after 100 ms; the + bar turns 90° and collapses, 240 ms `--ease-out`.
- Bottom CTA (v4.2): the hero's white pill + fine print, centred, pulled 48 px up into the Questions padding; magnetic + wipe like every StartLink (`from: "footer"`).
- Footer: a quiet "Questions" text link (→ `#questions`) leads the legal links (v4.2: the only Questions link outside the section). Giant wordmark rises `14 % → 0` as it scrolls in (scroll-driven), cropped by a mask that fades to 8 %.
- Lenis: desktop only (fine pointer, no reduced motion), loaded on the first wheel event, `lerp 0.1`, anchors offset −124 px. Touch is native.
- Magnetic pills (`ds/Magnetic`, every primary pill): 22 % of the cursor offset, clamped 8 px, follow 140 ms `--ease-out`, release 520 ms `cubic-bezier(.34,1.56,.64,1)`; mouse only.
- CTA → flow: a white circle grows from the click point (`clip-path`, 560 ms `--ease-io`); `/start` is pushed at 380 ms and fades the wipe off once painted. `/start` is prefetched when idle after load (or on first hover/focus), never on the critical path.

**Flow**
- Screen change: enter `y ±18 → 0`, blur 6 → 0, opacity, 520 ms `--ease-out`; exit `y ∓12`, blur 4, 220 ms ease-in; `AnimatePresence mode="popLayout"` so both overlap. Children cascade 60 ms (heading, field, actions).
- The typed answer travels: the field's visible text is a `layoutId` span (`ans-name`, `ans-company`, `ans-title`); on Continue it flies into the answer trail above the next question on the `travel` spring (measured 730,391 w171 → 778,263 w77 in ~600 ms). On A5 the name flies from the trail into the profile card; on A6 it flies back into the trail. While you type, re-centring is instant so the text never lags the caret.
- Search stage line (v4.1, `StageLine`): under the bar, the furthest stage the poll reported, in words (`site.select.apply.search.stages`: search "Searching LinkedIn…", people "Looking through people named {first}…", profile "Reading the profile…" (also a pasted link and "No, not me"), found "Checking it's you…" for the 450 ms at 100 %; under it, "This usually takes a few seconds." since the prefetch). Exit `y −5` + fade 180 ms, then enter `y 6 → 0` + fade 420 ms `--ease-out` (`AnimatePresence mode="wait"`), fixed 20 px box, `aria-live=polite`.
- Answer trail wrap (v4.1): when it wraps (390, three answers), an answer that starts a line drops its "·" and gets a hard flex break before it, so no line opens with a separator. Measured with all separators shown in a layout effect, re-measured on answer or column-width change.
- Short phones (`short-phone` = ≤ 767 px wide and ≤ 760 px tall): screen top 56 → 24 px, gaps 32 → 20, the pinned actions' margin 32 → 16, the profile card's gaps tighten, so A5's card clears the pinned Yes/No at 390 × 720. Shorter (667) the content scrolls out from under the bar and a 16 px white fade marks its edge.
- Resume on touch (`(pointer: coarse)`, read after mount): "Tap to choose a PDF or DOCX" / "Tap to choose another".
- Progress (DS/Footer): five 2 px segments, each fill is `scaleX`, 600 ms `--ease-io`, 40 ms stagger. Done segments full, the current one 25 %; on A4 the fourth segment is the real search progress.
- Honest search progress (`flow/api.ts` `searchProgress`): each stage the poll reports sets a floor (search 8 %, people 45 %, profile 74 %, found 100 %); inside a stage the bar eases toward the next floor (τ 5 s, ≤ 85 % of the gap); 120 ms clock; on `found` it shows 100 % for 450 ms before A5.
- LinkedIn visual: magnifier sweeps a small loop (2.8 s ease-in-out), a light band crosses the tile (2.2 s `--ease-io`) while searching.
- Profile card: springs in (`snap`, y 24 → 0, scale .96 → 1); photo fades in on load (500 ms); experience rows cascade 60 ms from 180 ms. A partial card shows two `animate-pulse` skeleton rows (s300) until its full profile lands; the swap is in place (no re-spring).
- Resume: drop area lifts the icon 2–4 px on hover/drag, scales 1.01 with a solid border while dragging; the chosen file fades in (350 ms).
- Done (v4.1, it stays alive): still rises `y 48 → 0` + fade, 1.8 s `--ease-out`; name letter by letter (34 ms stagger, 640 ms each, `y .35em → 0`, blur 8 → 0); credit caps, the line (560 column, F10). The sun blooms: a white radial glow over the still's sun (50 % / 49 %), `scale .35 → 1` + fade over 6 s from 0.5 s, then an 8 s ease-in-out pulse (`scale 1 ↔ 1.07`, opacity `1 ↔ .8`) forever (`.done-sun`, CSS); light spreads along the horizon, a soft-light ellipse `scaleX .3 → 1` + fade over 7 s (`.done-spread`), so the clouds brighten and the horizon line stays. The three place chips rise one by one (`y 36 → 0`, 1.3 s `--ease-out`, 450 ms apart; Steve r2: 120 made them pass through the email line and the Done pill); 1.5 s after each rises, its chip fades out (`scale .94`, 450 ms) and, 300 ms after, its sample role line fades up in the same spot ("Staff engineer · payments · SF", "ML engineer · health · Bay Area", "Founding engineer · dev tools · remote"), then the set idles. Under them, "Examples of what Tal sends." (13 px, s600, `done.rolesNote`) fades up with the first role line, so nobody reads the samples as roles already found (Steve r2). Done pill at the same time as before (it never waits on the show).

**Reduced motion:** CSS animations off (hero, landmarks (shown all lit), grain, marquee, sheen, caret, dots, scroll-driven parallax, Done's sun and spread), the chat thread, numbers and steps render in their end state, Lenis is never loaded, Magnetic and the wipe do nothing, Motion's `MotionConfig reducedMotion="user"` drops transforms in the flow. `docs/team/shots-v4/landing-*-full-reduced.png` is that page. A7 renders its final state at once (`useReducedMotion`: role lines shown, chips gone, sun at rest).

**Verified 5 Nov 2026 (Steve #13)** with CDP `Emulation.setEmulatedMedia` `prefers-reduced-motion: reduce` in headless Chrome (`/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/cdp-check.mjs`; the Chrome extension can't emulate media): on `/`, `matchMedia` reports reduce, `.hero-img`, `.hero-logo`, `.marquee-track` and `.wordmark-idle` all compute `animation-name: none`, Lenis never loads; on `/start` (A6 → Continue → A7, 0.5 s in, at 1440 and 390) `.done-sun`/`.done-spread` compute `none`, every chip is at opacity 0 and every role line at 1, with no transform. Control run without the emulation: the sun runs `done-bloom, done-pulse` and the chips are still at opacity 0 at that moment. Shots: `shots-v4/flow-A7-1440-reduced.png`, `flow-A7-390-reduced.png`. The same run with `Emulation.setTouchEmulationEnabled` matched `(pointer: coarse)` and A6 read "Tap to choose a PDF or DOCX" (`flow-A6-390-touch.png`).

## Keyboard and a11y
Enter continues on every question; Continue/Yes are real buttons; the field gets focus on new screens (fine pointers; on phones the heading gets focus instead so the keyboard doesn't jump mid-transition); headings are focusable for screen readers; errors are `role=alert`, linked with `aria-describedby`; the progress bars are labelled `progressbar`s; FAQ buttons carry `aria-expanded`/`aria-controls`; the marquee is focusable (focus pauses it); focus ring is the DS 2 px #222 (white on dark) with a 2 px gap.

## Preview tooling (development only)
- `/start?state=` `A1 A2 A3 A4 A5 A5partial link notfound ratelimited dailycap searchdown offline A6 sending A6b noemail A7` opens any screen with invented data (Aryan Mehta, Halcyon Labs). In preview, actions are simulated (no network); answering your way into A4 walks the search like the prototype (found at ~2.9 s); opening A4 directly holds it still. A screen opened by `?state=` skips its entrance animations (the swap has `initial={false}`), so to watch A7's show open `?state=A6` and press Continue.
- `/preview`: every screen at 1440 × 900 and 390 × 844 in iframes. `/preview?s=<i>&w=390&bare=1` is one frameless screen (used by `scripts/shots.sh`, since headless Chrome can't go below 500 px wide).

## Analytics (`lib/analytics.ts`, no-op)
`landing_view` (utm) · `flow_start` (from: hero | nav, and on /start mount with the referrer path) · `step_view` (step = Figma code, A1…A7, A5b-*) · `linkedin_found` (score, seconds, partial, src, after_title_ms; or full_after_partial) · `linkedin_confirmed` · `linkedin_rejected` · `linkedin_failed` (reason) · `resume_added` · `resume_rejected` · `resume_skipped` (email path) · `upload_failed` · `done`.

## How to add a landing section
1. Copy: add a block under `site.select` in `content/site.ts` (plain lines, Tal is "it").
2. Make `components/landing/<Name>.tsx` as a **server component**. If something must react to view, use `useSeen` in a small client component and toggle an `is-on` class; animate with CSS transitions on transform/opacity (or `animation-timeline: view()` for scroll-linked, inside `@supports`). Don't import framer-motion on the landing.
3. Section padding: `px-4 md:px-12`, bottom `pb-24 md:pb-40`; headings 28/34 → 40/48 semibold −1 px; glass cards use `.glass` (+ `.glow` and `useGlow` for the highlight).
4. Add it to `app/page.tsx` in Figma order, add a reduced-motion rule, and add its node id to the table above.

## Budgets (measured 5 Nov 2026, `npm run build` + `next start`, Lighthouse 12, local)
| page | perf | a11y | best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` mobile (3 runs) | 96–97 | 100 | 100 | 100 | 2.5–2.7 s (simulated; observed 0.12 s) | 0 | 10–50 ms |
| `/` desktop | 100 | 100 | 100 | 100 | 0.7 s | 0 | 0 ms |
| `/start` mobile | 98 | 100 | 100 | 66 (noindex on purpose) | 2.3 s | 0 | 40 ms |

LCP on mobile is the hero still; Lantern charges it for the ~170 KB of framework JS (React, the App Router) that downloads in parallel. The image itself is a 34 KB AVIF, preloaded at high priority.
