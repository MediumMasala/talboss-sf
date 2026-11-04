# Frontend (v4.1, 5 Nov 2026)

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
  landing/              RaisedBar, Nav, Hero, Marquee, Chat, BehindTal (+ CountUp, ProductMock), How, Deal, Faq, Footer,
                        StartLink (CTA + wipe), SmoothScroll (Lenis), LandingView (analytics), useSeen
  flow/                 Flow (state machine + screens), Done, ProfileCard, LinkedInVisual, api (fetch + honest progress),
                        motion (shared transitions), mock (preview data)
content/site.ts         every word (components read only from here)
lib/analytics.ts        track(): no-op, logs in dev
```
**Dependencies added:** `lenis` only. `framer-motion` (already there) is used **only by the flow** (`LazyMotion features={domMax}` inside `Flow`, synchronous, because a `layoutId` node only gets a projection if the feature is loaded when it mounts). The landing is CSS transitions, CSS scroll-driven animations and ~1 KB of vanilla pointer code. That is what got Lighthouse desktop from 77 to 100 and mobile to 96–97.

**State (flow):** one `useReducer` in `Flow.tsx` (steps `name → company → title → search → confirm → resume | email → done`, plus `link`, `notFound`, `rateLimited`, `dailyCap`, `searchDown`, `offline`). A `history` stack drives Back (the transient `search` step is skipped). The lookup is the v3 logic, kept: `POST /api/linkedin/start`, poll `GET /api/linkedin/poll` (first poll 300 ms, then 1.7 s, always the latest token, give up at 120 s), `POST /api/linkedin/profile` for "No, not me", branch on `code` (429 `rate_limited` / `daily_cap` with `Retry-After`, 502 search down, 503/no network offline). Upload is the v4 seven-field payload (no pitch, no work authorization); the confirmed profile goes with its signed photo link (the backend keeps the LinkedIn URL behind it).

## Figma → components
| Figma | code |
|---|---|
| DS/Logo Tile 2:63 | `ds/LogoTile` (44.64 / 40 px, radius 12, shadow 0 4 6 @14 %) |
| DS/Header 1440 2:165 · 390 2:208 | header in `Flow` (88 / 64 px, "Questions?" outline pill → `/#questions`) |
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
| Landing 4:42 / 5:64 | `app/page.tsx`: RaisedBar 20:964 · Nav 4:46 · Hero 4:43 · Marquee 21:964 (+ DS/Logo Marquee Row 18:1395) · Chat 4:79 · BehindTal 4:123 (+ DS/Product Mock · Roles 19:923) · How 4:154 · Deal 22:1164 · Faq 4:195 · Footer 4:224 |

Deviations from the frames, on purpose: the quiet answer trail above each question (it is how the typed answer travels, see below); a consent line on A6/A6b (legal); the `offline` and `searchDown` states (not drawn; built in the daily-cap layout); copy where `site.ts` differs from the interim Figma text (site.ts wins); A6's Figma progress showed step 1 (a frame slip), the code shows step 5.

## Every animation (timing · easing · property)
Vocabulary (`globals.css` `:root`, `flow/motion.ts`): `--ease-out` `cubic-bezier(0.16,1,0.3,1)` · `--ease-io` `cubic-bezier(0.7,0,0.3,1)` · `--ease-hover` `cubic-bezier(0.25,1,0.5,1)` · spring `travel` (stiffness 260, damping 30, mass 0.9, ≈500 ms) · spring `snap` (420 / 30 / 0.8, ≈350 ms, one small overshoot). Transform and opacity only, except a short blur on entry.

**Landing**
- Hero art: `scale(1.08) → 1`, 2.4 s, `--ease-out` (CSS, runs before hydration; opacity never animates so the image counts for LCP at once). Grain: a 160 px PNG noise tile at 9 %, stepped on transform, 900 ms `steps(6)` loop. (An SVG feTurbulence grain cost ~700 ms of raster; replaced.)
- Wordmark (hero 160 / 96 px tall, nav, footer): logo SVG as a mask over the silver ramp. Idle sheen: sweep in 1.6 s on the in-out curve every 5.2 s (first at 0.9 s). Pointer (fine pointers): sheen follows the cursor, 600 ms `--ease-out`; tilt up to 7° Y / 5° X, 500 ms; back to idle 1.2 s after the pointer stops.
- Hero copy: logo rises 14 px + blur 6 → 0, 1.2 s at 150 ms; sub, CTA, fine print 0.9 s at 550 / 670 / 750 ms.
- Nav: clear over the hero, wordmark hidden; when the hero logo leaves (IntersectionObserver, 120 px top margin) the bar turns to glass (black 60 % + blur, 300 ms) and the wordmark fades in (opacity + 6 px, 320 ms `--ease-out`).
- Raised bar: sticky top 0, glass 6 % + hairline + blur; wraps after "Peak XV" on phones.
- Marquee: two copies of the row, `translateX(0 → −50%)` 42 s linear, infinite; pauses on hover and focus; edge fades 96→320 px (desktop) and 24→96 px (phones); logos at 40 %, 18 px rows on phones.
- Chat card: starts when 45 % in view. Per Tal message: typing dots (1.2 s loop, 160 ms apart) for its pause (≤ 900 ms), then the bubble lands `y 12 → 0, scale .98 → 1`, 520 ms `--ease-out`; role rows slide in 90 ms apart from 180 ms; your reply after 1.5 s. Pauses are data (`site.select.chat.messages[].after`). All bubbles are laid out from the start (CLS 0). Cursor-following highlight on the glass (`useGlow`, radial 420 px fill + 260 px rim, 300 ms fade).
- Behind Tal: numbers count up from 0 when 80 % in view, 1.6 s easeOutExpo, tabular figures over an invisible copy of the final value (no width change). Product mock: phone floats `y +36 → −36 px` and the highlight drifts `x −30 % → 30 %` across the card's pass (CSS `animation-timeline: view()`; still elsewhere); at 50 % in view the three "Yes" pills pop (`scale 1 → 1.12 → 1`, 500 ms, 140 ms apart from 500 ms) and the "Intro sent" notification drops in at 1.1 s (`y −24 → 0`, 620 ms `cubic-bezier(.34,1.56,.64,1)`).
- How it works: a step lights when its top passes 62 % of the viewport and stays lit: hairline fills `scaleX 0 → 1` in white, 700 ms `--ease-io`; number and title 46–50 % → 100 % white (still AA when dim).
- The deal: glass card with the cursor highlight; the orb floats 6 px / 1.02 on a 9 s ease-in-out loop.
- Questions: grid-rows `0fr ↔ 1fr`, 360 ms `--ease-io` (no measuring); answer fades 220 ms after 100 ms; the + bar turns 90° and collapses, 240 ms `--ease-out`.
- Footer: giant wordmark rises `14 % → 0` as it scrolls in (scroll-driven), cropped by a mask that fades to 8 %.
- Lenis: desktop only (fine pointer, no reduced motion), loaded on the first wheel event, `lerp 0.1`, anchors offset −124 px. Touch is native.
- Magnetic pills (`ds/Magnetic`, every primary pill): 22 % of the cursor offset, clamped 8 px, follow 140 ms `--ease-out`, release 520 ms `cubic-bezier(.34,1.56,.64,1)`; mouse only.
- CTA → flow: a white circle grows from the click point (`clip-path`, 560 ms `--ease-io`); `/start` is pushed at 380 ms and fades the wipe off once painted. `/start` is prefetched when idle after load (or on first hover/focus), never on the critical path.

**Flow**
- Screen change: enter `y ±18 → 0`, blur 6 → 0, opacity, 520 ms `--ease-out`; exit `y ∓12`, blur 4, 220 ms ease-in; `AnimatePresence mode="popLayout"` so both overlap. Children cascade 60 ms (heading, field, actions).
- The typed answer travels: the field's visible text is a `layoutId` span (`ans-name`, `ans-company`, `ans-title`); on Continue it flies into the answer trail above the next question on the `travel` spring (measured 730,391 w171 → 778,263 w77 in ~600 ms). On A5 the name flies from the trail into the profile card; on A6 it flies back into the trail. While you type, re-centring is instant so the text never lags the caret.
- Progress (DS/Footer): five 2 px segments, each fill is `scaleX`, 600 ms `--ease-io`, 40 ms stagger. Done segments full, the current one 25 %; on A4 the fourth segment is the real search progress.
- Honest search progress (`flow/api.ts` `searchProgress`): each stage the poll reports sets a floor (search 8 %, people 45 %, profile 74 %, found 100 %); inside a stage the bar eases toward the next floor (τ 5 s, ≤ 85 % of the gap); 120 ms clock; on `found` it shows 100 % for 450 ms before A5.
- LinkedIn visual: magnifier sweeps a small loop (2.8 s ease-in-out), a light band crosses the tile (2.2 s `--ease-io`) while searching.
- Profile card: springs in (`snap`, y 24 → 0, scale .96 → 1); photo fades in on load (500 ms); experience rows cascade 60 ms from 180 ms.
- Resume: drop area lifts the icon 2–4 px on hover/drag, scales 1.01 with a solid border while dragging; the chosen file fades in (350 ms).
- Done: still rises `y 48 → 0` + fade, 1.8 s `--ease-out`; name letter by letter (34 ms stagger, 640 ms each, `y .35em → 0`, blur 8 → 0); credit caps, the line, then the three chips on a spring (stiffness 260, damping 20, 90 ms apart); Done pill last.

**Reduced motion:** CSS animations off (hero, grain, marquee, sheen, caret, dots, orb, scroll-driven parallax), the chat thread, numbers, mock and steps render in their end state, Lenis is never loaded, Magnetic and the wipe do nothing, Motion's `MotionConfig reducedMotion="user"` drops transforms in the flow. `docs/team/shots-v4/landing-*-full-reduced.png` is that page.

## Keyboard and a11y
Enter continues on every question; Continue/Yes are real buttons; the field gets focus on new screens (fine pointers; on phones the heading gets focus instead so the keyboard doesn't jump mid-transition); headings are focusable for screen readers; errors are `role=alert`, linked with `aria-describedby`; the progress bars are labelled `progressbar`s; FAQ buttons carry `aria-expanded`/`aria-controls`; the marquee is focusable (focus pauses it); focus ring is the DS 2 px #222 (white on dark) with a 2 px gap.

## Preview tooling (development only)
- `/start?state=` `A1 A2 A3 A4 A5 link notfound ratelimited dailycap searchdown offline A6 sending A6b A7` opens any screen with invented data (Aryan Mehta, Halcyon Labs). In preview, actions are simulated (no network); answering your way into A4 walks the search like the prototype (found at ~2.9 s); opening A4 directly holds it still.
- `/preview`: every screen at 1440 × 900 and 390 × 844 in iframes. `/preview?s=<i>&w=390&bare=1` is one frameless screen (used by `scripts/shots.sh`, since headless Chrome can't go below 500 px wide).

## Analytics (`lib/analytics.ts`, no-op)
`landing_view` (utm) · `flow_start` (from: hero | nav, and on /start mount with the referrer path) · `step_view` (step = Figma code, A1…A7, A5b-*) · `linkedin_found` (score, seconds) · `linkedin_confirmed` · `linkedin_rejected` · `linkedin_failed` (reason) · `resume_added` · `resume_rejected` · `resume_skipped` (email path) · `upload_failed` · `done`.

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
