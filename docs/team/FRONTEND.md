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
