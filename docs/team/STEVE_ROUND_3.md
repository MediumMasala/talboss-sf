# Steve, round 3

**What I looked at:**
- my own shots of all 12 preview states (including `rateLimited` and `dailyCap`), desktop 1440×900 and mobile 390×844 @2x, plus full pages, in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-r3/`;
- live `/api/pitch` on 7 fixtures (founder, infra, PM, data scientist, frontend-mock, thin, infra+answer);
- a real browser run on the founder's cached profile: type → found → "Yes, that's me" → the live email card (`flow-4-pitch.png`).

That last run was a cache hit, so no paid run. The rate limit didn't trip this time, which is consistent with "only paid runs count."

## 1. VERDICT: PASS

> "Huh. It found me, wrote the email it would send a founder about me, and let me fix it in one line. That's better than any recruiter has done. I'll try it."

I'd put this in front of an engineer at Anthropic or OpenAI today, with the Tal name on it.

## 2. Scores (round 2 in brackets)

| | /10 | |
|---|---|---|
| First impression | 7.5 (7.5) | Calm and credible. The dot line and the Tal point read at once. The hero is still quiet, and the "cool" lives at step 3. That's acceptable, because the CTA "Draft my intro" points straight at it. |
| Trust | 8.5 (7) | A rate limit or daily cap now gets its own honest screen, with "Paste my LinkedIn link" as the main action. The Peak XV line, "You're early" and the deal are all true. |
| Copy | 8.5 (8) | The repeated sentence is gone. "Tal · Tal Select" is clean. The `needsMore` line is true in both states ("only has your LinkedIn so far"). |
| Design and taste | 8.5 (8) | The sharpened highlight is now one ultramarine span, exactly the user's sentence. It reads as "your line, in the intro", which is the right feeling. |
| Flow | 8.5 (7) | "Looks good as is" sits above the fold on desktop (y≈740) and is a sticky bar on mobile. The real founder run went found → card → pitch with no friction. |
| The AI moment | 8 (7.5) | Two factual sentences, no formula. Tomás, Hannah and Mei read like a sharp recruiter wrote them. Noise-free beats clever. |
| Mobile | 8 (7.5) | The funding line sits under the hero sub, the nav is one row, the first input is above the fold, and the sticky CTA works. |

## 3. What blocks shipping

Nothing.

**Before you show the founder (process, not product):** `frontend-shots-r3/desktop-contact-sheet.png` is **stale**. Its pitch, sharpened and done panels still show the round-2, three-sentence "gets a… over hype" draft. The live server and `preview.ts` show the new two-sentence draft. Regenerate the sheets so the founder judges what ships.

### After ship (not blockers, owner noted)
1. **BACKEND:** don't parrot mission statements from the about text. The founder's live draft opens "builds Tal Boss at Grapevine to scale technology that impacts a sizeable number of people", lifted from his about. When the about is a slogan, prefer a concrete job description. Also watch for scrambled time order: "focused on consumer tech… after helping startups grow through Google Ads", and Hannah's "after two previous team failures".
2. **BACKEND:** the live frontend-mock draft differs in wording from the `preview.ts` string; generation isn't deterministic. Shape and quality match, so this is fine. If the preview must stay verbatim, re-record it each time the prompt changes.
3. **FRONTEND (optional, later):** the hero is the one place still quieter than the product. If you ever want more nerve above the fold, show a ghosted sample email card, clearly labelled as a sample, behind the form. Don't do it for this launch.

## 4. Keep (do not lose these)
- The email card right after "Yes, that's me" (To / From: Tal · Tal Select / Subject), typed out, with the draft tag and "goes out only after you say yes to a role".
- One sharpening question, the single-span highlight of their own words, and "Looks good as is" as the no-pressure exit.
- Two-sentence factual pitches, the vet (no invented numbers or names, no tails, no filler), the hedged retry, and p95 around 1.6 s.
- Honest failure states: "Tal couldn't find you." only when that's true, rate-limited and daily-cap screens that never say it, and paste-link first.
- The rate limits, which count only paid runs: 30/h per network, 3/h per network+name, 300/day.
- The resume as a reward ("Want it sharper? Give Tal your resume."), "No resume handy? Tal will work from your LinkedIn.", "Draft my intro", "Represent me".
- The done screen: "You're early. Tal's first US intros go to the first members.", the representation date, the email, and dashed lines captioned "your first intros, when you say yes". No stale CTAs.
- The field with you, Tal and the startups; "Each dot is 30 people… You're the blue one."; paper / ink / Newsreader / Geist; one ultramarine; the "Member of Technical Staff" placeholder; the Peak XV line; the deal; the FAQ.
