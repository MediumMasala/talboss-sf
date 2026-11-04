# HIRING: the v3 team

From Steve, 4 Nov 2026. Three people: a copywriter, a frontend designer-engineer and a backend engineer. Each of you has read only `BRIEF_V3.md` and `DIRECTION.md`. Each brief below stands on its own. Read both of those documents in full before you start; they're short.

The repo is `~/Desktop/Tal by Grapevine/talboss-sf`, on branch `tal-select-us`. The dev server is http://localhost:3217 (`npx next dev -p 3217`). The previous v2 design and copy are rejected. The backend and the API contract (`docs/team/API.md`) are kept, apart from the changes listed for the backend below.

Shared rules:
- Don't edit files you don't own; tell the orchestrator instead.
- Never print, echo or commit secrets.
- Real LinkedIn lookups cost money. Test only with "Sanchit Tripathi" at "Grapevine".

---

## 1. The copywriter

### Who I'm hiring
Someone who has written for people who read closely: book jackets, a literary agency's letters, a great magazine's front-of-book, or a film distributor's one-sheets. They write letters people keep.

They've studied:
- David Abbott's long-copy ads (plainness, respect for the reader);
- Howard Gossage (talking *with* the reader);
- the Think Different scripts (values, not features);
- Patagonia's early catalogue essays (warm and specific);
- the way A24 writes almost nothing and trusts the image;
- E.B. White on omitting needless words.

They've also read real intro emails from good agents and recruiters, and they know the difference between one that gets a reply and one that gets archived. They hate slogans. They read everything aloud.

### Your brief
**What you own:** `content/site.ts` (every user-facing string: headings, body, buttons, field labels, placeholders, loading stages, errors, rate-limit and daily-cap screens, done screen, FAQ and meta tags) and `docs/team/COPY.md`, which records every string, where it appears and why it's worded that way.

**The idea you're writing for:**
- The page opens on a photograph and one word, **Talent**, with a sentence telling the reader that's what we call the people we represent. It ends on a title card with **their name** and "Represented by Tal, until [date]".
- In between, Tal finds them on LinkedIn, asks "Is this you?", and writes the letter it would send a founder about them.
- The reader arrives as "talent" in general and leaves as a named person with an agent.

**Naming:**
- The brand and the sender is **Tal**. Tal is "it" or just "Tal", never "he".
- The page speaks as **"we"**, the people at Tal.
- "Tal Select" never appears anywhere.
- Never use "Tal is the talent agent for senior software engineers". A competitor (Dex) owns that sentence.
- Mention AI once, plainly: our software reads every profile and role, and people on our team decide who meets whom.

**Voice:**
- A great agent talking across a table, late, to someone they believe in.
- Whole sentences, concrete nouns, contractions, warmth and no tricks.
- Use: represent, introduce, intro, role, founder, the person who makes the call.
- Never use: interview, candidate, apply, talent pool, match, unlock, seamless, game-changer, supercharge.

**Banned patterns** (any one fails the draft):
- tidy parallel taglines;
- "your X, every time";
- "X has one job";
- "not X, but Y" in any disguise;
- clipped two- or three-beat slogans;
- em dashes;
- fake intimacy ("we've got you");
- "Done. That's it." and "No catch.";
- rhetorical questions in headings;
- anything that sounds like a SaaS landing page.

**Never bring back from v2:** "Keep building. Tal makes the intros.", "Your yes, every time.", "Six months, then you decide.", "Your data has one job.", "Your name goes out only with your yes.", "An AI agent with a human team behind him.", "Who should Tal represent?", "Join Tal Select", "Each dot is 30 people…".

**Claims you may use, worded exactly:**
- "We have raised $7 million from Peak XV (formerly Sequoia Capital)." Use it once, in the top bar and footer constant.
- 300,000+ tech professionals in the network. Use it once. Never "active" or "every week".
- 5,000+ AI and consumer startups. This is the founder's figure and unverified. Keep it in one constant (`site.claims.startups`), use it at most once, or leave it out.
- Free for the talent; companies pay when they hire.
- We ask before putting anyone forward.
- Representation lasts six months, shown as a real date (it's computed; write the template, e.g. "until 4 May 2027").
- The story: Grapevine (India's largest anonymous professional network, more than a million verified professionals sharing real salaries and company truths), then Round1 (an AI-interview hiring agency, profitable, placing engineers at India's fastest-growing AI companies), then Tal. Built by a team of about 20 in Bengaluru.

  The Sarvam detail in BRIEF_V3 ("Sarvam's head of engineering became its CTO") is ambiguous. **Confirm the exact fact with the founder before you use it.**
- **Forbidden:** testimonials, invented people, press, "as seen in", and any implication that the Bengaluru faces on the page are SF members.

**Strings to write, in flow order:**
1. **Top bar:** the funding line. **Sound toggle:** "SOUND OFF" / "SOUND ON".
2. **Opening frame:** the word *Talent*, and one or two sentences beneath it (direction: "That's what we call the people we represent. Tal is a talent agent for engineers, researchers, PMs and designers, and we're opening in San Francisco now.").
3. **Form:**
   - a one-line intro;
   - labels for full name, company and title (keep the placeholder "Member of Technical Staff");
   - primary button (direction: "Find me on LinkedIn") and secondary "Paste my LinkedIn link instead";
   - the mono credit line under the live name, "REPRESENTED BY TAL".
4. **Search:** three honest stage lines for the API stages `search`, `people` and `profile`, plus a slow-search reassurance ("This usually takes about 15 seconds").
5. **Error screens**, each honest and each leading with "paste your link". Only the not-found screen may say we couldn't find them:
   - not found;
   - rate limited (`code: "rate_limited"`);
   - daily cap (`daily_cap`);
   - Apify down;
   - offline.
6. **"Is this you?"** Buttons: "Yes, that's me", "No, not me" and "Paste my link". Plus the line when we've run out of profiles after three.
7. **The letter:**
   - header: To "A founder in San Francisco", From "Tal", and the Subject template "{Name}, {title} at {company}";
   - signature "Tal, a talent agent";
   - the "goes out only after you say yes to a role" line, which you must reword without the banned "your yes" shape;
   - the `needsMore` question (one question, the way an agent would ask it) and "Looks good as it is".
8. **Resume step:** the offer ("Want it sharper? Add your resume."), the quiet alternative ("No resume handy? We'll work from your LinkedIn."), the email field and its error, and the upload errors. **There is no work-authorization question anymore. Delete its strings and its FAQ.**
9. **Done title card:** the credit line ("REPRESENTED BY TAL · UNTIL {date}") and three sentences covering:
   - what happens next;
   - the address we'll write to (`{email}`);
   - that nobody hears their name until they say yes.
10. **Below the fold:**
    - **"What an agent does":** three short prose paragraphs, each under 45 words, about reading their work properly, finding the role and the person who makes the call, and asking first;
    - **"Where we come from":** about 80 words, plus the contact-sheet caption "People on Tal in Bengaluru";
    - **the terms**, written as a short letter of engagement signed "The Tal team, Bengaluru", under 120 words;
    - **up to six FAQs** with answers of two sentences or fewer;
    - **end credits:** the closing action ("Ask Tal to represent you"), "Made in Bengaluru by the team behind Grapevine" and a photo-credits line template.
11. **Meta:** title, description and OG text (the OG image is "Talent" on a photograph).

**Process:**
- Write one version, not options. The hero is the only exception: give at most three alternates, ranked, with your pick first.
- Read every line aloud before you hand it in. Then grep your own draft for every banned pattern and paste the clean grep output at the bottom of COPY.md.
- When you're unsure whether a fact is true, leave it out and list it as a question for the founder.

**Done:** a stranger reads the page aloud and it sounds like one person talking to them.

---

## 2. The frontend designer-engineer

### Who I'm hiring
Someone who has built sites for a film distributor, a publisher, a photographer or a museum. They've worked where the image carries the page, and they still ship clean, fast, accessible React.

They can grade a photograph (curves, a LUT, protecting skin tones) and they care about the grain. They know the difference between 600 ms and 800 ms, and they can feel `cubic-bezier(0.22,1,0.36,1)` against `ease`. They've studied:
- A24's site and its title cards;
- the Criterion Collection's restraint;
- Apple's product pages for pacing;
- Jack & Jill's video carousel;
- the India Tal site's floating faces.

They hate template SaaS layouts. They never ship a box grid and call it design.

### Your brief
**What you own:** `components/**`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/opengraph-image.tsx`, `public/**`, `docs/team/FRONTEND.md` and the asset rows in `docs/team/ASSETS.md`.

**Step 0: the mandatory interaction study.** Do this before you write a line of code.
- **The sites:** tal-boss-web.vercel.app (ours, including the Tal Boss / Tal Select toggle), jackandjill.ai, meetdex.ai, why.zero.university and a24films.com.
- **Use them for real:**
  - scroll the full length slowly, then fast;
  - hover every kind of element;
  - click the toggles and carousels;
  - draw the zero on Zero;
  - play a Jack & Jill video;
  - resize to 390 px.
- **Tools:** use the Chrome browser tools if your session has them (open your own tab, never close tabs you didn't open, never log in, never submit forms or accept anything beyond the most private cookie option). Otherwise drive local Chrome over CDP. `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-frames.mjs` already captures scroll frames, a mouse sweep, hover states and each site's fonts and easing. Extend it to hover specific elements and capture before-and-after frames.
- **Write it up** at the top of `FRONTEND.md`, one paragraph per site on what you *felt* and how each interaction works: trigger, duration, easing, what moves, the cursor, sound, and how the copy talks.
- **Then** name the three interactions you're taking, and from which site, and the three you're refusing and why.

Reading CSS isn't the study. Using the sites is.

**What to build:** exactly the page in DIRECTION.md §7.
1. Opening frame: a graded full-bleed photo and *Talent*, with the first form step on a linen card. The name field is set **live in the display serif**, keystroke by keystroke.
2. Search, with honest stages driven by the API `stage` and `Math.max` on the stage index.
3. "Is this you?", where the profile develops in like a print.
4. The letter, on paper. The draft is complete when it arrives, so type it out word by word at about 35 ms a character with pauses at punctuation. It finishes within 2.5 s and is instant under reduced motion. This step also holds the `needsMore` question, the single highlight of their own words, and "Looks good as it is".
5. Resume, optional: a hairline drop zone, plus the no-resume email path.
6. Done title card: their name in the serif on a graded photograph, a 1.2 s dissolve and the credit line with the date.
7. Below the fold, each built to the shape given in DIRECTION.md §7:
   - offset photo-and-prose pairs;
   - the labelled sample letter;
   - "Where we come from", with the contact sheet of real Bengaluru faces from `public/india/people/`;
   - the terms as a letter;
   - FAQ;
   - end credits.
8. Keep all preview states working with mock data and no network: `/?preview=you|search|confirm|notFound|rateLimited|dailyCap|resume|noResume|sending|done|pitch`. Then shoot desktop (1440) and mobile (390, iframe wrapper) contact sheets **from the live server** and save them in `docs/team/frontend-shots-v3/`. Stale sheets are a failure.

**Remove work authorization completely:**
- the `WorkAuth` component and its render in `components/select/Apply.tsx` (around line 627);
- the `auth` action and the `workAuth` state field (around lines 45, 79 and 107);
- `workAuth` in the preview mocks (around lines 239 and 241);
- `workAuth` from the upload payload (around line 417);
- `work_auth` from the `track("resume_uploaded", …)` call (around line 432).

Delete the dead v2 parts: the dot field (the canvas), `GoldenGate.tsx`, `golden-gate-paths.ts`, `Hands.tsx`, `BrandMarquee.tsx` and the four-column `HowItWorks`. Move or delete them only after confirming nothing else imports them.

**Visual system** (DIRECTION.md §5 has the exact values):
- **Colours:** forest night `#14261D`, moss `#3F5B45`, linen `#F6F1E7`, ink `#1C1B17`, and lamp `#E3A13B` (only for the main action and the live moments).
- **Type:** Libre Caslon Display (next/font) for display, the system UI stack with Inter as fallback for text, and IBM Plex Mono for credits.
- **Photography:** one grade baked into the files at build time with a LUT or curve (sharp, or ffmpeg's `lut3d`), output as AVIF and WebP with explicit width and height. Add a tiled grain overlay at 4–7% opacity that's still under reduced motion.
- **Banned:** grey-on-beige, equal four-column text grids, boxed 2×2s, dot fields, icon cards, pill-chip rows, logo strips, stat counters, custom cursors, scroll-jacking and WebGL.

**Motion:**
- title push-in (1.00 → 1.04 over 12 s);
- line-by-line fade-up (700 ms, `cubic-bezier(0.22,1,0.36,1)`, 120 ms stagger);
- section crossfades (600–900 ms);
- hovers (250 ms `cubic-bezier(0.215,0.61,0.355,1)`, a slight photo warm-up and a hairline underline that draws from the left);
- a bottom dock on mobile ("Ask Tal to represent you") that hides while the form is in view.

Use framer-motion through LazyMotion strict (`m.`, not `motion.`). Everything has a reduced-motion path.

**Sound:**
- Off by default, behind one fixed toggle bottom-left, remembered per viewer (localStorage in try/catch).
- A room-tone loop ≤ 80 KB Opus, one felt-piano note on "Yes, that's me", and a two-note phrase on the done card.
- Load the audio only after the toggle is turned on. Nothing plays before it. Ceiling −24 LUFS.

**Honesty rules (non-negotiable):**
- Every image, sound, font and texture gets a row in `docs/team/ASSETS.md` (file, source URL, author, licence, where used) **before** it's committed. Allowed: Tal-owned (`public/india/`), the Unsplash licence, the Pexels licence, CC0 and original work.
- Never use film stills, A24 posters or frames, anything from Minari, CODA or Amélie, AI-generated people, or stock office clichés.
- The India people photos appear in one place only, captioned "People on Tal in Bengaluru". They're never presented as SF members and never paired with invented quotes.
- No staff photos.
- Photographs of people are atmosphere. They're never captioned as members, and no quote is ever placed next to them.
- No fake numbers, logos, press or testimonials. The sample letter is labelled "SAMPLE" and uses an obviously fictional person.
- Progress never lies: stages come from the API, and there are no fake percentages.
- Credit every photographer by name in the end credits.
- Don't self-host SF Pro. The Scotch Deck font is used only if its web licence is confirmed in ASSETS.md.

**Engineering:**
- Next 16 App Router. **Read `node_modules/next/dist/docs/` before you use any Next API**; this version has breaking changes. Also React 19, Tailwind v4, Cloudflare via OpenNext.
- npm with `--cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache`. No heavy dependencies.
- `npx tsc --noEmit` stays clean.
- Budgets: mobile Lighthouse performance ≥ 90, LCP ≤ 2.5 s on throttled 4G (the hero image is preloaded and ≤ 180 KB on mobile), CLS ≤ 0.02, and nothing overflows at 390 px.
- Visible focus states, proper labels and full keyboard use through the whole flow.
- The flow must work end to end against the real API with the founder's profile.

**Done:** you hand me the live page plus fresh contact sheets. I use it on a laptop with sound on, on a phone at 390 px, and with reduced motion on, and in the first five seconds I forget I'm looking at a website.

---

## 3. The backend engineer

### Who I'm hiring
The engineer who built the current backend is the right person. It's careful, honest about latency and cost, and well vetted. Keep the contract, the limits, the cache and the vet. The job this round is small and exact.

### Your brief
**What you own:** `lib/**`, `app/api/**`, `app/sheet.csv/**`, `migrations/**` and `docs/team/API.md`.

**1. Drop work authorization (stop collecting it; keep history).**
- `app/api/upload/route.ts`: delete the `WORK_AUTH` set (line 18) and stop reading `workAuth` (line 50). Always store `null` for new rows, and ignore the field if an old client sends it.
- `lib/storage.ts`: make `workAuth` optional in the type (line 33) and write `null` (line 88). Keep the `work_auth` column. **No destructive migration**: old rows keep their values, and migrations stay additive only.
- `app/sheet.csv/route.ts`: keep the column so the founder's sheet doesn't break (new rows are blank). Mark it deprecated in API.md.
- `API.md`: remove `workAuth` from the documented `application` shape and add a one-line deprecation note.

**2. Rename the sender and the programme in everything user-facing.**
- Grep `lib/` and `app/api/` for "Tal Select" and for "Tal and his". Anything a person or a founder could read becomes "Tal". The internal `program` value can stay `"select"`.
- In `lib/pitch.ts`, the SYSTEM prompt (line 126) changes from "a warm intro email from Tal Select, a small talent team" to "a warm intro email from Tal, a talent agent that represents strong tech people to US startup founders".

**3. Make the intro read like a person wrote it.** The current drafts are accurate but read like LinkedIn summaries. Examples:
- the founder's draft says "builds technology designed to scale" and "impact a sizeable number of people", lifted from his About mission statement;
- several drafts open a sentence with "This work involves", "reflecting a focus on" or "focusing on";
- chronology gets scrambled ("after focusing on consumer tech…", "after two previous team failures").

The target is how a sharp agent writes to a founder they respect: two plain sentences, concrete, with contractions allowed and varied sentence length.

Changes:
- **The prompt:**
  - replace the VOICE line with: "VOICE: an agent who has read everything about this person, writing two sentences to a founder friend. Plain words, concrete nouns, active verbs. Write it the way you would say it out loud.";
  - add: "When the About text is a mission statement or slogan, ignore it and describe the actual job.";
  - add: "Keep time order right: say what they do now, then what came before, using 'before that' or 'earlier' only when FACTS shows the order."
- **The vet** (`vet()`): reject the sentence openers "This work", "This role", "This included" and "This involves". Reject "focusing on", "focused on" (unless it's in their facts), "reflecting", "designed to", "ensure(s)", "sizeable", "impactful", "leverag*", "passionate" and "dedicated to". Reject any phrase of six or more words copied verbatim from the About text when that text has no concrete noun (a system, product, metric or named project).
- **The template fallback** (`templatePitch`, line 110): replace "Before that: X." with a sentence a person would say: "{First} is a {title} at {company}, and before that worked at {X}." When there's only a title: "{First} is a {title} at {company}." Keep it honest and short.
- **Bump the cache key** (`pitch:v15` → `pitch:v16`) so no old-voice drafts are served.
- **Re-record `docs/team/PITCH_SAMPLES.md`** verbatim on all fixtures with the new prompt. Report p50 and p95, the fallback count, and how many drafts the new vet rules rejected.
- Keep these unchanged: exactly two sentences, no closing line, no invented facts, no gendered pronouns, the hedged retry and the 3.7 s budget.

**4. Optional, only if it's cheap and the data is already there:**
- If the Apify profile already includes a profile-photo URL, expose it as an optional `photo?` on `Profile`, so "Is this you?" can show the person their own face. Proxy it, or fetch it once into KV for the lookup's lifetime, rather than hot-linking LinkedIn's expiring CDN URLs.
- The photo is never stored with the application and never shown to anyone but the person.
- If it costs an extra Apify run, don't do it.

**5. Don't change anything else:**
- the endpoints, shapes, status codes and `code` values;
- the rate limits (30/h per network, 3/h per network and name, 30/h for pasted links, 300/day globally);
- the cost caps, the 6 h lookup cache and the 7-day pitch cache window.

**Done:**
- `npx tsc --noEmit` is clean;
- the curl recipes in API.md pass (a no-resume upload without `workAuth` returns `{ok:true}`, and an old client sending `workAuth` still returns `{ok:true}` with `null` stored);
- the new PITCH_SAMPLES.md reads like a person wrote every intro;
- API.md is updated.
