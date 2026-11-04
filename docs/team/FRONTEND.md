# FRONTEND (v3)

Owner: frontend designer-engineer. 4 Nov 2026.

## Step 0: the interaction study

How I studied them: headless Chrome over CDP (`~/.claude/jobs/17f7f79e/tmp/fe-study.mjs`, extending Steve's `steve-frames.mjs`). On each site it waited for the hero, took two frames 1.5 s apart (does it breathe?), swept the mouse corner to corner (does it follow you?), hovered five kinds of element and read their computed styles at 0, 120 and 450 ms (what changes, how fast, which curve), wheeled down one and a half screens at a time and shot each screen at 110 ms and 900 ms (how things arrive), fast-scrolled to the bottom, then re-ran at 390 px. Site actions: clicked the Tal Boss / Tal Select pill and shot it at 150, 550 and 2,000 ms; drew a circle on Zero with the mouse held down; scrolled Jack & Jill's video carousel into view, hovered and clicked a clip. No logins, no forms, cookie banners left unanswered. Frames and per-site JSON are in `~/.claude/jobs/17f7f79e/tmp/fe-study/` (`SHEET-<site>.jpg` for the overview).

**Tal India (tal-boss-web.vercel.app).** It breathes. Two frames 1.5 s apart differ: about thirty rounded face tiles drift on their own, and they move again when the mouse crosses the screen, so the crowd feels aware of you. Hovers are 160 ms on `cubic-bezier(0.16,1,0.3,1)`, a fast-out expo, so a button answers before you finish arriving (the nav link fills `#F5F5F8`, the dark CTA brightens to 1.12). The best moment is the pill: click Tal Select and by 150 ms the whole page is already night, by 550 ms the chat thread ("Pari · Tal Select Partner: Sent a shortlist of top 8…") has settled. No navigation, no reload; the room changes around you. The copy is plain and factual. The footer's giant gradient "tal Select" wordmark is the only heavy thing. At 390 px it holds, nothing overflows. What I felt: a busy, friendly lobby.

**Jack & Jill (jackandjill.ai).** Marist serif at 72 px on white, Diatype for everything else. Mouse movement shifts small panels a few pixels (light parallax). Hover feedback is minimal and mostly instant (`0s ease`; "Back to top" just darkens from 72% to 88% ink). Scrolled into view, the testimonial carousel shows four portrait clips of people in real rooms (brick wall, plants, a window), each with a play glyph and yellow burned-in captions; nothing autoplays, every video is `muted`, and a click starts the clip still muted, so you read a person before you'd ever hear them. Further down, three numbers (6,388 / 428,625 / 122,210,821) count up in serif, and small dithered landscape photos are scattered beside "Making the job market run like clockwork". What I felt: the people in the videos are warm; everything around them is a SaaS template.

**Dex (meetdex.ai).** Cream ground, a halftone orange-dusk mountain bleeding into the hero, Easy Grotesk at 60 px. Nothing drifts and nothing follows the mouse; the life is inside the embedded product (a typing caret, job cards with "Why Dex matched you"). Every hover is Tailwind's default `0.15s cubic-bezier(0.4,0,0.2,1)`: the black CTA lightens to 85%, the "raises $5.3M" link fades to 80%. It's app tempo, competent and slightly cold. The bottom is the strongest frame: mountains dissolving under a ghosted outline logo, with a green "All systems operational" dot. At 390 px it stacks cleanly. What I felt: a calm product, a printed landscape doing the soulful work, and no people.

**Zero (why.zero.university).** One 900 px viewport, full WebGL, `cursor: none` everywhere and a drawn hand cursor instead. "DRAW A ZERO" in mono with a faint ring; holding the mouse and tracing a circle draws a glowing white stroke that follows the pointer exactly. On release the marble water blooms to white in about 300 ms, a gold spark and "+100 XP" appear at 1.5 s, and by 4 s a swash script "You Believed" has written itself. The wheel doesn't scroll a page, it moves through scenes (a ruler "-100 BZ" across the top, a green hand, petals, "College would… land You"). The dock ("Join Beta", "Beta is open to everyone. Start now") never leaves; its glass button lifts over 0.6 s `ease`. What I felt: I took part before I was told anything, and one gesture got a beautiful answer. Then it turns into a game.

**A24 (a24films.com).** A full-bleed close-up of a face in natural light, Neue Montreal at 225/180 px with -11 px tracking running off the right edge, one small outlined "BUY TICKETS →". It doesn't drift and doesn't follow the mouse. Hovers are instant (`0s`): a nav item just gains an underline, no fade at all. Wheeling down, frames stack like reels (two faces, then a pair), then shelves on thin rules with tiny mono labels. At 390 px the face goes portrait and the title drops to two lines at the bottom of the frame, still set on the image. No sound anywhere. What I felt: confidence. Nothing explains itself; the face is the hero.

### Three interactions I'm taking
1. **The answer to one gesture (Zero).** Zero rewards a drawn circle with beauty. Ours rewards typing your name: it's set live in Libre Caslon at the top of the card, keystroke by keystroke, with no lag, crossfading in from the placeholder on first focus. Plus Zero's dock: one action always within reach, as a slim mobile bar that hides while the form is on screen.
2. **Type set on the photograph, one action per frame (A24).** The opening frame and the done title card are full-bleed graded photographs with the display word set on the image and one plain action. Nav and footer links answer instantly with a hairline underline that draws from the left in 250 ms (`cubic-bezier(0.215,0.61,0.355,1)`), a touch slower than A24's 0 s because ours draws.
3. **The room changes around you (Tal India's pill).** No page navigation in the flow. The card's steps crossfade in place, and at the end the whole stage dissolves (1.2 s) into the title card with your name, the way the pill turns the India page to night without a reload.

### Three I'm refusing
1. **Zero's custom cursor, WebGL and scroll scenes.** `cursor: none` and a drawn hand make a game; scroll-jacking takes the page away from the reader. Direction bans all three, and an engineer at night wants their own pointer.
2. **Tal India's mouse-parallax floating faces.** It's the most alive thing we own, but floating real people around a sales line on the US site would read as "these are our members". The India faces get one honest, still contact sheet instead.
3. **Counting numbers and logo walls (Jack & Jill, Dex).** Odometers and logo strips are the SaaS tells the founder rejected, and the India logos would imply US openings. One number, set once in text. Also refused: Dex's default 150 ms Tailwind ease on everything; that's app tempo, and we work at film tempo.


## v3 build (4 Nov 2026)

**Files.** Everything lives in `components/tal/`: `Stage.tsx` (the flow: the opening frame, the letter and the title card; the reducer, polling, pitch and upload logic carried over from v2's `Apply.tsx`), `Sections.tsx` (top bar, what an agent does, sample letter, where we come from, terms, questions, end credits), `Controls.tsx` (sound toggle and dock), `Photo.tsx` + `photos.ts` (graded `<picture>` with AVIF/WebP, explicit sizes, grain), `sound.ts`, `flow-store.ts`, `Reveal.tsx`, `fonts.ts`, `preview.ts`. `app/page.tsx` composes them; `app/opengraph-image.jpg` is static. Grade: `scripts/grade-photos.mjs` (one analytic grade, also written as `scripts/tal-grade.cube`), run with `node scripts/grade-photos.mjs`.

**Deleted** (after checking that only `/v2` and `/drop` imported them): `app/v2`, `app/drop`, `components/select/*` (incl. the dot field), `GoldenGate`, `golden-gate-paths`, `Hands`, `BrandMarquee`, `HowItWorks`, `Hero`, `Nav`, `Footer`, `FundingBar`, `ui`, `components/light/*`, `components/resume-drop/*`, `public/img` (hands), `public/tal-boss-wordmark.svg`, and the dynamic `opengraph-image.tsx` (it fetched its own background over HTTP, which hung in dev).

**Work authorization:** gone from the UI, state, previews, payload and `track()`. Grep of `components/` and `app/` (excluding `app/api`) for `work.?auth|tal select`: no matches.

**How the three interactions were built.**
- Name as a title: `LiveName` sets the name field in Libre Caslon Text italic at the top of the card on every keystroke (no animation on the letters; size steps down after 13 characters). "Your name" sits at 30% and dims to 20% on first focus (600 ms, film curve), then crossfades out on the first letter. Mono credit "REPRESENTED BY TAL" under it.
- Type on the photograph: "Talent" at clamp(84px, 17vw, 250px) on the graded frame, 12 s push-in (1.00 to 1.04, linear), title and sentence fade up with CSS (700 ms, 120 ms stagger) so they show before hydration. The type reads because a darkroom burn is baked into the bottom of the title frames, not a CSS gradient.
- The room changes around you: no navigation. Card steps crossfade in place (600 ms in, 220 ms out). The frame dissolves to the letter on forest night (800 ms) and the letter dissolves to the title card (1.2 s), with the two-note phrase.

**Other motion.** Search shows only the stages the API reported (`search`, `people`, `profile`, `found`, Math.max on the index), each with its real start time and a real clock; "This usually takes about 15 seconds" fades in after 6 s. "Is this you?" develops like a print (opacity plus 6 px blur clearing over 500 ms). The letter types word by word at 35 ms a character, +120 ms at commas, +260 ms at full stops, scaled to finish within 2.5 s; instant under reduced motion and in previews. The person's own words are highlighted once (lamp wash settling to a lamp hairline over 2.4 s). Hovers: 250 ms `cubic-bezier(0.215,0.61,0.355,1)`; links draw a hairline from the left; photos warm about 3% on hover via a soft-light layer (no filters). Grain: one 160 px tile at 5.5%, stepping at 10 fps, still under reduced motion. Sections fade up 700 ms once.

**Sound.** Off by default; `SOUND OFF / SOUND ON` bottom-left in mono, remembered in localStorage (try/catch). No audio element exists until it's on. Room tone fades in over 1.8 s; the felt-piano note plays on "Yes, that's me"; the phrase plays as the title card appears. Opus first, AAC-LC fallback. All original, -24 LUFS (see ASSETS.md).

**Dock.** One fixed bar: the sound toggle always, plus "Ask Tal to represent you" once the stage is off screen (IntersectionObserver), hidden on the title card. Full-width bar on phones; on desktop only the button, bottom-right.

**Logo row (founder decision, overrides DIRECTION.md).** One quiet row at the end of "Where we come from", caption `select.proofLine` ("Bosses from these companies hire on Tal"). Only the twelve verified companies: Google, Microsoft, Amazon, Uber, Salesforce, Adobe, LinkedIn, PayPal, Intuit, Spotify, Razorpay, Sarvam. Each mark is a CSS mask filled with linen at 70%, so it sits inside the grade. No marquee, no tiles. The NVIDIA/Stripe/Databricks/Okta/eBay files in `public/brands/` are not rendered.

**Previews** (dev only, no network): `/?preview=you|search|confirm|notFound|rateLimited|dailyCap|searchDown|offline|pitch|sharpened|resume|noResume|sending|done`. All render cleanly at 1440 and at 390 with no horizontal overflow (checked by the shot script: desktop page 8,712 px, mobile 8,591 px, scrollWidth 390).

**Shots** (fresh, from the live dev server): `docs/team/frontend-shots-v3/`: `sheet-desktop-states.jpg`, `sheet-mobile-states.jpg` (390 px iframe), `sheet-desktop-page.jpg`, `sheet-mobile-page.jpg`, `sheet-e2e.jpg`, plus every single frame. Scripts: `~/.claude/jobs/17f7f79e/tmp/fe-shots.mjs`, `fe-e2e.mjs`.

**End to end, real API, once:** "Sanchit Tripathi" at "Grapevine" (cached lookup). The profile was found on the first poll (score-matched, correct person), the letter arrived and finished typing about 5 s after "Yes, that's me", the no-resume path with a@example.org posted, and the title card read "Sanchit Tripathi / REPRESENTED BY TAL · UNTIL 4 MAY 2027". The draft: "Sanchit builds Tal Boss at Grapevine after working as an investment professional for consumer tech and marketplaces at Elevation Capital. Earlier, Sanchit helped startups grow their businesses through ads as a Google account manager."

**Gotcha for whoever edits next.** Custom CSS lives in `@layer components` in `globals.css`. Unlayered rules beat Tailwind utilities in v4: an unlayered `.photo { position: relative }` silently beat `absolute`.

**Not done / open.**
- Lighthouse, LCP on throttled 4G and CLS were not measured on a production build (only the dev server ran). The hero is preloaded per breakpoint (AVIF 32 KB mobile, 37 KB desktop at 1920), all images carry explicit dimensions, and fonts swap.
- The email/upload subject uses the LinkedIn title when no title was typed ("Sanchit Tripathi, Building at Grapevine"). That's honest but reads oddly; backend or copy may want a rule.
- The deprecated v2 keys in `site.ts` (`hero.eyebrow`, `how`, `deal`, `about`, `final`, `light`, `howItWorks`, `proof.brands`, `upload.matching/done`) are no longer read by any component, and the copywriter can delete them.

---

## v2 notes (superseded, kept for history)

# Frontend: Tal Select US (round 3)

## Round 3 (Steve R2 fixes 1, 2, 5, 6)
- **1, load is not "not found".** A lookup error with `code: "rate_limited"` or `"daily_cap"` (from start, poll or "not me") opens its own `busy` step, using `apply.rateLimited` or `apply.dailyCap`. "Paste my LinkedIn link" is the primary action and skip is the quiet link. It never reaches "couldn't find you". Previews: `?preview=rateLimited` and `?preview=dailyCap`.
- **2, the highlight marks the person's idea.** After a rewrite we highlight at most 2 runs of consecutive words that all come from the typed answer (stemmed, so "cuts" matches "cut"). Each run needs 2 or more content words, and stopwords are trimmed from both ends. It no longer diffs against the old draft.
- **5, the button is always in reach.** The pitch step is tighter on desktop: "Looks good as is" ends at y≈853 at 1440×900, with the needsMore box open. On phones the button rides in a sticky bottom bar, portalled so the panel's transform can't trap it.
- **6, the mobile nav is one row.** The funding line, verbatim, moves under the hero sub on phones as one quiet line.
- `needsMore` now picks `needsMoreLinkedIn` when the profile is confirmed and `needsMoreThin` otherwise.


## Round 2 (Steve must-fixes 2, 3, 4, 8, 9, 10 and the bold move)
- **Bold move, the email step.** After "Yes, that's me", a new `pitch` step shows the intro as the email a founder would get: To ("a founder hiring for a <role> role"), From, Subject, then the draft written out as it arrives. Under it is the one-line question (`email.questions[0]`). It is always shown as optional; when `/api/pitch` returns `needsMore:true`, the box turns blue with the `email.needsMore` line above it. Submitting calls `/api/pitch` again with `answer`, dims the old draft ("Rewriting with your answer"), then types the new one, and every word that wasn't in the old draft glows blue and settles to ink. "Looks good as is" goes on to the resume step, which is now framed as the reward ("Want it sharper? Add your resume."). The no-resume path is unchanged. The upload sends the latest draft as `application.pitch` and `pitchSource`. The counter is now five steps: You, LinkedIn, Intro, Resume, Done.
- **3, the field explains itself.** One sentence at 13.5px next to the "you" point: "Each dot is N people in the Tal network. You're the blue one." N is the live ratio. The ring breathes once on first paint, then holds still. The count-up and the corner legend are gone.
- **4, done is honest.** The intro lines are dashed and still, with no pulses, and the targets are outlined, not filled. The line under the point becomes "Dashed lines are your first intros, when you say yes." The hero note hides from the intro step on; the nav and final-CTA "Join" buttons hide after done.
- **8:** the Numbers section is deleted.
- **9:** the sending ticks fill strictly top-down. Each line is done only when every line above it is.
- **10, mobile.** The hero is compressed so the first input is fully visible at 390×844, and every step change scrolls the card's top into view on phones. That fixes a StrictMode bug where the page scrolled to the card on load.
- **2:** `preview.ts` now holds verbatim `/api/pitch` output for the Jordan Avery fixture: the first draft (`source: ai`, `needsMore: true`, the same text as PITCH_SAMPLES.md) and the rewrite after the answer "Cut p99 latency on our inference stack from 900 ms to 180 ms". Both were recorded on 4 Nov.
- **Tal, the agent (founder decision).** Tal gets an ink point in the field, the counterpart to the blue "you", labelled "Tal" in Geist. During search, the sweep goes out from Tal. Once LinkedIn confirms who you are, a solid ink line joins you to Tal, meaning he represents you. Every dashed intro line then runs from Tal to the startups, never straight from you. The email card's From row carries the same mark. No mascot, no face.
- New previews: `?preview=pitch` and `?preview=sharpened`.

## Round 1

## Concept in five lines
1. **The network, drawn to scale.** The hero is a canvas of the Tal network: every dot is a fixed number of people and every hollow square a fixed number of startups. The legend prints the exact ratio for your screen ("1 dot = 25 people").
2. **You are the one blue point.** It shows up as an open ring that says "you". As you type your name it takes that name, and once LinkedIn confirms you it switches to your LinkedIn name.
3. **The field follows the real state of the form.** The search sends a sonar ring out from you. The resume step dashes three intro lines toward nearby startups. Done turns them solid, with one quiet pulse on each. Nothing moves just for decoration.
4. **Everything around it is quiet:** warm paper, ink, an editorial serif, one ultramarine for "you". Trust comes from Mercor and micro1. The nerve comes from zero.university, where the page is a world you're standing in.
5. **The wait is honest, not dressed up.** There's a real clock, the real stages the server reports, and the literal Google query we ran. The AI pitch arrives last, typed out as a draft.

## What was removed, and why
- **Michelangelo hands, Golden Gate, scribble underline:** illustrations of "connection" and "SF". The field is the connection, and it holds the visitor's real data, so it doesn't need metaphors.
- **Hero chips:** they repeated the sub. Their facts now live in "The deal".
- **Silver shimmering funding bar:** the Sequoia line stays, word for word, as plain text in the nav and footer. A strong fact needs no glare.
- **Black canvas:** replaced by paper. It's calmer and more editorial, and the dots read as data, not as a starfield.
- **Logo strip:** dropped. Most of those bosses are in India, and on an SF page the logos read as US openings. It costs trust without adding much.
- **Compare table:** replaced by `deal`, on the copywriter's advice. The table read as template SaaS.
- **Timed fake progress** on "sending": every tick now matches a real event. The upload response ticks the first two lines, and the pitch promise resolving ticks the third.
- **Scroll-reveal animation:** tried, then cut. It hid content from full-page captures and added nothing.

The old components for `/drop` and `/v2` (Hands, GoldenGate, BrandMarquee, light/*) are untouched, and those routes still work.

## Tokens
Type (`next/font/google`, loaded only on `/` through `components/select/fonts.ts`):
- **Newsreader** (variable, opsz, with italic): `font-serif`. Used for headlines, step titles, the pitch, numerals. The hero's line one is italic and muted, line two is roman ink.
- **Geist**: `font-sans`. Used for the interface and body text.
- **Geist Mono**: `font-mono`. Used for labels, the step counter, the search log, the legend, and the field's canvas labels.

Scale: hero `clamp(46px, 7.4vw, 96px)` / 0.96; step title 28–30; done title 34–38; section index mono 11.5 / 0.1em uppercase; body 15–18.

Colour (`:root:has(.ts-root)` in `app/globals.css`, exposed to Tailwind as `paper`, `paper-2`, `surface`, `line`, `line-strong`, `ink`, `ink-hover`, `body`, `muted`, `placeholder`, `signal`, `danger`):
| token | value | use |
|---|---|---|
| paper | `#f4f2ec` | page, field |
| paper-2 | `#ebe8df` | wells (pitch card, log, inputs at rest) |
| surface | `#fffefb` | the form card |
| line / line-strong | `#e2ddd1` / `#cbc4b4` | hairlines |
| ink / body / muted | `#0e0e0c` / `#34322d` / `#6f6b62` | type |
| signal | `#2b3cff` | "you" only: your point, intro lines, active step, the pitch tag |
| danger | `#c2361f` | errors |

## Components (`components/select/`)
- `SelectHero.tsx`: nav, field host (pinned to the first screen's height so a taller card never resizes the field), headline, legend, the `data-field-you` anchor, the form card, `hero.note`.
- `NetworkField.tsx`: one 2D canvas and one rAF loop. It pauses off-screen and in hidden tabs, and under reduced motion it draws one static frame per state change. It uses a seeded layout (no reshuffle) and dims dots under anything marked `data-field-avoid`. Intro lines never cross text or the card.
- `network-store.ts`: a tiny external store, so the form tells the canvas `{step, label}` without re-rendering anything.
- `FieldLegend.tsx`: the honest key, with a one-time count-up to `claims.network`.
- `Apply.tsx`: the whole state machine. you → (manual) → search → confirm / notFound → resume / noResume → sending → done.
  - Poll timing: the first poll waits 300 ms, later ones 1.7 s. It always uses the latest token and gives up at 120 s.
  - The search log has three lines (`search.lines`): Google and people search run in parallel, then the profile is read, then a 450 ms "lining it up" beat before the card.
  - `POST /api/pitch` fires once, when the resume step opens (right after "Yes, that's me", or after a skip or a typed link). The upload waits at most 6 s for it, then sends `application.pitch` and `application.pitchSource`.
  - No-resume path: a small link under the drop zone (`noResume.link`, or `linkNoLinkedIn` when LinkedIn was skipped) leads to an email field. It submits without a `resume` part and with `application.email`.
  - Resume: choose a file or drop it anywhere on the card, then press "Send my application". Work auth is optional and can be toggled off again.
- `ProfileCard.tsx`: the "Is this you?" card (initials when there's no photo) and `MiniProfile`.
- `Sections.tsx`: How it works, The deal, Numbers, Who's behind this, FAQ, Final CTA, Footer. Each has a mono index on the left and sits on a 12-column grid.
- `ApplyLink.tsx`: the final CTA scrolls back to the card and focuses its first field.
- `app/opengraph-image.tsx`: the same idea at 1200×630, with `select.og.*`.

## Preview states (dev only)
`npx next dev -p 3217`, then open `http://localhost:3217/?preview=<state>`:
`you`, `search`, `confirm`, `notFound`, `pitch`, `sharpened`, `resume`, `noResume`, `sending`, `done`.
- The mock person is fictional: Jordan Avery, Senior ML Engineer at Parallax Labs. There's no photo, so the card uses initials. The data lives in `components/select/preview.ts`.
- Preview mode makes no network calls. Buttons still click through with mocks.
- It is gated on `process.env.NODE_ENV === "development"`. It also turns off framer transitions and the field's fill-in, so headless Chrome captures each state at rest.
- Desktop: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1000 --virtual-time-budget=7000 --screenshot=OUT.png "http://localhost:3217/?preview=done"`
- Mobile: wrap the URL in a 390px iframe in a local HTML file, and use `--virtual-time-budget=14000`.

## Open items for other roles
- **Copy (temporary strings in code):** `WAIT_COPY` "Usually about 15 seconds." in `Apply.tsx`. Please move it to `apply.search.wait`, because the lookup is now ~12 s and the current key still says 30–60 s. Smaller ones: the step-counter labels "You / LinkedIn / Resume / Done", "Back" on the manual step, "tap to change" on the picked file, the section label "Numbers" (`stats` has no heading key), the legend lines, and the consent tail ", and to Tal Select representing you for six months."
- **The search log's detail lines are literal** (`google site:linkedin.com/in "Name" Company`, `people "Name" Company`). They mirror `lib/linkedin.ts`. If the backend changes the query, update `Search` in `Apply.tsx`.
