# Steve, v3 round 2

**What I looked at** (4 Nov 2026, commit cd1658d; shots are in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-v3-r2/`):
- **Laptop:** the live page full screen in real Chrome, with stored settings cleared first.
- **The founder's flow, end to end:** Sanchit Tripathi / Grapevine / Strategy Lead, typed and submitted with Enter → found (cached) → "Yes, that's me" → the letter → "Looks good as it is" → "No resume handy?" → a test email (`steve-review@example.org`, local dev only) → the done title card.
- **Scripted Chrome:** frames at 1440×900 and 390×844, `?preview=done` on mobile, and a reduced-motion run.
- **Checks:** greps, and mobile Lighthouse.

## 1. VERDICT: PASS

> "It found me, wrote a straight two-line note about me, and then put my name over San Francisco like a film poster. Nobody's made me feel like that about a job. I'm in."

I'd put it in front of the Anthropic or OpenAI engineer tonight. The founder can read every line aloud.

## 2. The first five seconds (new hero)

A warm curtain, a window onto a misty orchard, and *Talent* on the dark cloth. It's quieter than the train reader and more Minari: green outside, warm inside, late light. Nothing in the frame is selling anything, and it doesn't read as stock. On mobile you also see the figure at the window in silhouette, which makes it human.

Then the name sets itself in italic as I type, and the done card lands with "Sanchit Tripathi" over the fog. That's the arc from the direction, working.

## 3. Scores (round 1 in brackets)

| | /10 | |
|---|---|---|
| First impression | 8.5 (8) | No third-party text. The type sits on calm cloth. |
| Soul | 8.5 (8.5) | Light, grain, Bengaluru faces, a signed letter. |
| Trust | 9 (8.5) | Unverified logos and dead keys are gone (`DEPRECATED` count 0). The 12 founder-verified marks stay. |
| Copy | 8.5 (8) | The sample letter's close is now a fact. Nothing banned remains. |
| Design | 8.5 (8) | One canopy photo, and the page is 6,987 px. |
| Flow | 8.5 (7) | Enter submits. "Looks good as it is" scrolls to and focuses the next step. Profile rows wrap. |
| The letter moment | 8 (6.5) | The founder's draft now reads: "Sanchit builds Tal Boss at Grapevine and leads strategy for the company. Earlier, Sanchit was an investment professional at Elevation Capital where the work focused on marketplaces, climate, agri, and consumer tech." It's true, grammatical and plain. It's as good as his LinkedIn allows. |
| Mobile | 8.5 (7.5) | The sound toggle is in the top bar, and nothing overlaps an input. The figure is visible in the hero. |

## 4. Fail checks (DIRECTION §8)

| Check | Result |
|---|---|
| Banned patterns | **Clean**, including "Tal Select". |
| Work authorization | **Gone** from content and components. |
| Assets | The new hero is logged (Wesley Mc Lachlan, Unsplash Licence, verified), and so is the OG image derived from it. Photographers are credited in the end credits. |
| No US-member implication | **Holds.** The faces are "People on Tal in Bengaluru", with no quotes. |
| Grids, dot fields | **None** |
| Reduced motion | **Holds.** Hero frame diff is 0.0, against 2.24 with motion on. |
| Sound | Off by default and loaded only after the toggle. I didn't judge it by ear. |
| Lighthouse, mobile | **99** on the dev server: FCP 1.5 s, LCP 1.6 s, CLS 0, TBT 70 ms, 1.2 MB. |

## 5. What still blocks shipping

Nothing.

**Before or right after ship (not blockers):**
1. **FRONTEND:** at 1440 the figure at the window sits behind the form card, so the desktop first frame has no person in it. Shift the hero's object-position, or the crop, so the silhouette shows between *Talent* and the card.
   - *Test:* the 1440×900 first frame shows the figure.
2. **FRONTEND:** on the done card, a hyphenated email breaks at the hyphen ("steve-" / "review@example.org"). Keep the address on one line, and wrap the sentence before it instead.
3. **FOUNDER:** listen to the sound on headphones before launch. The room tone is synthesised; if it reads as hiss, swap in a CC0 field recording.
4. **FRONTEND:** re-run Lighthouse on the production build (`npm run build` + preview) and record the score in FRONTEND.md.
5. **COPY/BACKEND:** the founder's letter would read better with a comma before "where" ("Elevation Capital, where…"). Fix it if the vet allows. Otherwise leave it.

## 6. Keep

Everything listed in round 1, plus:
- the new hero;
- Enter to submit;
- the scroll-and-focus between steps;
- the top-bar sound toggle on mobile;
- the funding line hidden on the done card;
- the wrapping casting rows.
