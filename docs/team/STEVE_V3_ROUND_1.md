# Steve, v3 round 1

**What I looked at** (4 Nov 2026, commits b79a552 and 1139699; shots are in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-v3-r1/`):
- **Laptop:** the live page full screen in a real Chrome tab with sound switched on. I typed the founder's own name and went through the whole flow: Sanchit Tripathi / Grapevine / Strategy Lead → found (cached, under 4 s, with his photo) → "Yes, that's me" → the letter → "Looks good as it is" → the resume step. I didn't submit; the engineer's `frontend-shots-v3/e2e-7-done.jpg` covers done.
- **Scripted Chrome:** scroll and hover frames at 1440×900 and 390×844 (mobile emulation), `?preview=done` on both, and a reduced-motion run. Contact sheets are `sheet-*.jpg`.
- **Copy:** every string in `content/site.ts`, read aloud.
- **Checks:** greps for the §8 fail checks, and mobile Lighthouse.

## 1. VERDICT: FAIL (close; one short round)

> "Okay, this is the first job site that made me stop and look. Then the first thing I read after 'Talent' was STIEG LARSSON, and the letter about me read like LinkedIn wrote it."

This is the right page, and most of it is beautiful. It fails tonight on two things the founder will hit in his first ten seconds: a crime novel's cover in the hero, and his own letter. Both are fixable in hours.

## 2. The first five seconds

"Oh."

A woman reading on a train, window light, real grain, warm, and the word *Talent* in that Caslon. It's quiet and it feels like the first frame of a film. Then my eye went to the book, and it says STIEG LARSSON in red and black capitals right next to the title. After that I couldn't stop seeing it.

Then I typed my name and it was set in italic at the top of the card, like a title. I smiled. That's the idea working.

The done card is the best thing we've made: the name huge in italic over SF fog at golden hour, with "REPRESENTED BY TAL · UNTIL 4 MAY 2027" under it. That's the poster.

## 3. Scores

| | /10 | |
|---|---|---|
| First impression | 8 | The photo, grain and type are right. The book cover takes it from 9 to 8. |
| Soul | 8.5 | It feels made by people: real light, faces from Bengaluru, the terms signed "The Tal team, Bengaluru". |
| Trust | 8.5 | The claims are exact. The Bengaluru faces are captioned honestly, with no quotes. The logo row is the founder-verified twelve. The FAQ answers like a person would. |
| Copy | 8 | Plain and warm. It sings in "That's what we call the people we represent." and "If you say no, nobody hears your name." It slips once, in the sample letter (must-fix 6). |
| Design | 8 | Full-bleed frames, paper on forest night, no boxes. Below the fold it runs long and leans on trees. |
| Flow | 7 | Fast and honest. But after "Looks good as it is" nothing visible happens, and the profile rows truncate mid-word. |
| The letter moment | 6.5 | The setting is a 9; the words are a 5. The founder's draft, verbatim: "Sanchit builds Tal Boss at Grapevine after investigating consumer tech and marketplace investments as an investment professional at Elevation Capital. Earlier, Sanchit worked as a Google account manager helping startups grow their business through Ads." |
| Mobile | 7.5 | The hero and the dock work. The fixed SOUND toggle sits on top of the Full name field. |

## 4. Fail checks (DIRECTION §8)

| Check | Result |
|---|---|
| Banned patterns in live copy and components ("every time", "one job", em dashes, he/him about Tal, "Tal Select", unlock, interview, candidate) | **Clean** |
| Work authorization in UI, copy, FAQ, previews or payload | **Gone.** `upload` ignores an old client's `workAuth` and stores null. The column is kept and marked deprecated. |
| Assets logged | **Pass** for every photo, sound, font and the 12 logos. Unused leftovers: `public/brands/okta.svg` and `ebay.svg`, and a dead logo list in `site.ts` that includes NVIDIA, Stripe, Databricks, Okta and eBay (see must-fix 8). |
| US-member implication | **Pass.** The contact sheet is "People on Tal in Bengaluru", with no quotes. The sample letter is labelled "SAMPLE · AN INVENTED PERSON". |
| Grids, dot fields, canvas, marquee | **None** |
| Reduced motion | **Pass.** Hero frames taken 1.2 s apart differ by 0.0 (2.27 with motion on). |
| Sound | Off by default, loaded only after the toggle (`sound.ts`), files 14–43 KB Opus. **Not judged by ear:** the room tone is synthesised pink noise with synthetic bird chirps. The founder should listen on headphones, and if it sounds like hiss, swap in a CC0 field recording. |
| Preview states | All 14 are shot in `frontend-shots-v3/`. I re-rendered home and done myself, and they match. |
| Lighthouse, mobile | **99** on the dev server: FCP 1.6 s, LCP 1.6 s, CLS 0, TBT 80 ms, 1.2 MB total. Re-measure on the production build before ship. |

## 5. Must-fix (ranked)

1. **FRONTEND: the hero.** Replace or recrop the opening photograph so no third-party title, brand or readable printed text is in the first frame. Today it's the Stieg Larsson cover at 1440 and 390, and *Talent*'s last letters sit on a white book page. Log the new photo in ASSETS.md.
   - *Test:* in the 1440×900 and 390×844 first frames, the only readable words are ours, and *Talent* sits on a calm, dark area of the image.
2. **BACKEND: the founder's letter.** In his draft, "builds X after investigating" scrambles the time order, "investments… investment professional" repeats itself, "Ads" is capitalised as it was in the source, and the draft never says what he's good at. Changes to `vet()`:
   - reject a content word (or its stem) used twice in one sentence;
   - reject an "after …" clause on the present-job sentence;
   - lowercase a generic noun the source capitalised ("Ads" becomes "ads" unless it's part of a product name).

   Also list which 2 of the 10 fixtures fall back, and why.
   - *Test:* re-record PITCH_SAMPLES.md; the founder reads his own draft aloud and says he'd send it.
3. **FRONTEND: the click after "Looks good as it is".** That click (and "Add it to the letter") changes only the step label, because the resume step is below the fold. Scroll "Want it sharper? Add your resume." into view and move focus to it: smooth, or instant under reduced motion.
   - *Test:* at 1440×812, the heading is in the viewport within 900 ms of the click.
4. **FRONTEND: the mobile sound toggle.** At 390 px the fixed SOUND toggle covers the Full name input (`m-home-*` frames). Move it into the top bar on mobile, or hide it while a form step is on screen.
   - *Test:* at 390×844, no fixed element overlaps any input in any preview state.
5. **FRONTEND: the funding line on the done card.** It's white on a bright peach sky (`d-done-00-hero.jpg`) and unreadable. Add a top scrim to that frame, or hide the line there.
   - *Test:* measured contrast is at least 4.5:1 behind the text.
6. **COPY: the sample letter's last clause.** "…which is why Noor is careful in exactly the places most engineers aren't" takes a dig at the reader's own trade, and it's the closing formula the backend bans. Replace it with a second fact.
   - *Test:* the sample passes `vet()` unchanged.
7. **FRONTEND: the "Is this you?" rows.** The experience rows cut words mid-way ("Building, tal by grap…", "Investment Professi…"). Wrap titles to two lines, or drop the duration column on narrow cards.
   - *Test:* no ellipsis on the founder's card at 1440 or 390.
8. **FRONTEND + COPY: length and leftovers.** Below the fold, the desktop page is about 8,700 px tall and shows five tree and park photographs, three of them in "Where we come from", so it starts to feel like a mood board. Keep one canopy photo there and aim for 7,000 px or less. Delete the DEPRECATED v2 keys and the unused logo list from `site.ts`, and the unused okta and ebay SVGs, so an unverified logo can't come back.
   - *Test:* `grep -c DEPRECATED content/site.ts` returns 0, and `document.documentElement.scrollHeight` is 7,000 or less at 1440.

## 6. Keep (do not lose these)

**The frames and the flow:**
- the *Talent* frame and its sentence: "That's what we call the people we represent.";
- the name set live in Caslon italic, with "REPRESENTED BY TAL" under it;
- "Is this you?" with their LinkedIn photo, and "We only read your public profile.";
- the letter on linen over forest night, with "To: A founder in San Francisco", "From: Tal", "Tal, a talent agent", and "We'll only send this to a founder you've agreed to meet.";
- the done title card: their name over SF fog with the dated credit line, and three plain sentences under it.

**The voice and the system:**
- honest search stages, and error screens that lead with pasting your link;
- the terms as a signed letter, and the FAQ answers, especially the six-month one;
- the Bengaluru origin story with the Sarvam line used once;
- the photographer credits in mono;
- the mobile dock that hides while the form is on screen;
- reduced motion, sound off by default, and a Lighthouse score of 99.
