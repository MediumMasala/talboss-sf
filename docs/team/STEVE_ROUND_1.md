# Steve, round 1

What I looked at: the four team docs, `site.select` and `site.claims`, the frontend's contact sheets, and my own shots in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-r1/`. Those are a 1440×900 fold and full page, 390×844 @2x mobile for every preview state, and a **real run with the founder's profile**: typed, searched, confirmed, then the resume step. I also called `/api/pitch` live for three people. For the bar I used mercor.com and micro1.ai (both screenshotted) and why.zero.university. Zero is WebGL and only shows its "99" loader headless. Its source shows it uses Newsreader, the same serif we chose.

## 1. VERDICT: FAIL

> "Nice serif, honest terms. Then the 'AI pitch' told a founder I'm a Member of Technical Staff at OpenAI and I'm worth meeting if they're building an AI product. I could have written that myself."

The shell is close. The thing we promise in the hero, "you'll read our draft intro before you leave," is the weakest part of the real product. The preview hides that because its mock pitch was written by a person. Live output today:

- `Priya is a Member of Technical Staff at OpenAI. If you are building an AI product, Priya is worth meeting.`
- `Ana is a staff engineer at Stripe. Consider meeting Ana if you're building a payments-related product.`
- Founder (from API.md): `Sanchit Tripathi is a Strategy Lead at Grapevine... Sanchit worked as... Sanchit is worth meeting if you are building a new venture.`

That is a mail merge. An engineer at Anthropic reads it as a sign the team doesn't know what good looks like. Taste in the frame and none in the payload is worse than no AI at all.

## 2. Scores

| | /10 | Why |
|---|---|---|
| First impression | 6 | Calm, credible, well-set type. In 5 seconds it reads as a tasteful editorial template. The network field looks like paper grain until you read an 11px legend. Nothing in the fold says "cool". |
| Trust | 5 | The deal is honest and clear. But no human is named anywhere, the eyebrow says San Francisco while the about section says Bengaluru, nothing shows any US company relationship, and every button says "application". |
| Copy | 7 | Crisp, no slop, peer voice. The hero line works. The CTAs are mechanical, the claims repeat back to back, and three different wait times are in play. |
| Design and taste | 7 | Paper, ink, Newsreader, Geist Mono and one ultramarine is the right system. Good restraint, good grid. Motion is so quiet it doesn't register. |
| Flow | 7 | The "Is this you?" card with the real photo and real jobs is genuine magic, and it was fast on a cached run (3.1 s). The sending ticks run out of order. The done screen keeps stale pre-apply copy. |
| The AI moment | 3 | See the verdict. The mock is an 8. Reality is a 3. |
| Mobile | 6 | No horizontal scroll (scrollWidth 390) and it reads well. But the first input sits about 735 px down and "Find my LinkedIn" is below the 844 px fold. The done card ends in stale copy and a second "Apply" CTA. |

## 3. Must-fix list (ranked)

1. **BACKEND: make the pitch worth reading.** Send the model the profile's about text, job descriptions and skills, length-capped; it gets none of them today, so it can only restate titles. Rewrite the prompt so it finds one specific angle: what they work on and what kind of team they'd make better. Ban the "worth meeting if you're building X" tail and any sentence that only restates a title. Lift the pronoun ban: allow "they", or restructure, so the first name appears at most twice. Keep the number and name vetting. When the facts are thin (typed title only, no LinkedIn), return a shorter honest line plus `needsMore:true` instead of faking depth.
   *Fixed =* run 6 real profiles (the founder plus 5 from the cache or with a profile). Every pitch has at least one concrete, fact-backed detail beyond title and company, no template tail, and the name at most 2×. In a blind side-by-side, the team can't tell it from the current hand-written mock. p95 stays under 4 s.

2. **FRONTEND: stop reviewing fiction.** Replace the mock pitch in `components/select/preview.ts` with the verbatim live `/api/pitch` output for the Jordan Avery profile (re-record it after fix 1).
   *Fixed =* `?preview=done` shows exactly what the API returns for that profile.

3. **FRONTEND + COPY: make the field mean something in 5 seconds.** A cold viewer can't tell the dots are people. Put one readable line next to the "you" point, at 13px or larger and not in the corner legend: "Each dot is 30 people in the Tal network. You're the blue one." Use the live ratio. Make the "you" ring breathe once on first paint. Drop the count-up on 300,000+: counters are SaaS clichés, and a mid-count "73,000+" in a screenshot looks like a bug.
   *Fixed =* shown the 1440×900 fold for 5 seconds, a person outside the team can say what the dots are.

4. **FRONTEND: the done screen must not imply intros were made, and must drop stale copy.** On done, three solid lines with pulses run to three startups. To an engineer that reads as "we've already sent you to three companies", which breaks "progress never lies". Keep them dashed with a caption ("your first intros, when you say yes"), or don't draw them. After done, remove "You'll read our draft intro for you before you leave this page." and the final-CTA "Apply to Tal Select" (and the nav "Apply" button).
   *Fixed =* desktop and mobile done shots show none of that pre-apply copy and no lines that look like sent intros.

5. **COPY: CTAs promise the payoff, not the plumbing, and wait times match.** Change "Find my LinkedIn" to a payoff-led line such as "Draft my intro" (LinkedIn is how, not why). Change "Send my application" to "Represent me" or "Finish". "Application" tells a not-looking engineer they're job hunting, so the word appears on no button; nav and final CTA become "Join Tal Select". Move the hard-coded `WAIT_COPY` "Usually about 15 seconds." into `apply.search.wait`, replacing the stale "About 30 seconds. Sometimes a minute."
   *Fixed =* `grep -i application` finds no button label, and the page has one wait string.

6. **COPY + FRONTEND: put a real human on the page.** "A person on our talent team" is a faceless promise, and this audience hands over a LinkedIn and resume to people, not to "teams". Use one or two real names with a photo and a LinkedIn link: who reads every profile and sharpens the pitch. They go in "Who's behind this" and in the done step ("This week: <Name> reads your profile"). These must be real people; the founder supplies them, and nothing is invented.
   *Fixed =* at least one real, linkable person is named on the page and on the done screen. If the founder declines, record that in STATE.md and leave it as is.

7. **COPY: honest SF positioning that turns "new" into an edge.** The page says "top SF and US roles" and shows no evidence of a single US relationship, and a skeptical engineer notices. Don't hide it; sell it: "We're opening Tal Select in SF now. The first members get our first US intros." Being early and few is attractive to this reader, and it is true. Change the eyebrow "Tal Select · San Francisco" to "Tal Select · now opening in SF", or similar.
   *Fixed =* no sentence implies an existing US company pipeline, and the hero or sub says this is new.

8. **COPY + FRONTEND: say each number once.** "Numbers" (300,000+ / 5,000+) sits right above "Who's behind this", which repeats both numbers. "6 months of representation" is not a stat. Delete the Numbers section and keep the claims once, in about. On desktop the "5,000+" also renders visibly smaller and lower than its neighbours; that goes away with the section.
   *Fixed =* each claim number appears once in the body (the legend aside).

9. **FRONTEND: sending ticks go top-down.** In the sending state, "Drafting how we'd introduce you" is checked while "Saving" and "Setting up" are still pending, which looks broken. Hold a lower tick until the ones above it are done (the real events can still drive them), or put the pitch line first.
   *Fixed =* no state shows a checked line under an unchecked one.

10. **FRONTEND: mobile gets to the form faster.** At 390×844, compress the field band (about 120 px) or tuck the legend. The "Full name" input must sit above the fold, and each step change must scroll the card's top into view, so "Is this you?" and the pitch aren't half off-screen.
    *Fixed =* on the mobile `?preview=you` shot the first input is fully visible at 844 px, and every step is captured top-aligned after its transition.

## 4. Keep (do not lose these)

- **"Keep building. We'll make the intros."** It is a peer talking, not a recruiter. The italic, muted line one over the roman line two is right.
- The **"Member of Technical Staff"** placeholder. It's a wink this exact reader will catch.
- The **"Is this you?" card**: real photo, real jobs, real tenure, in about 3 s on a warm cache. This is the moment people feel the product is intelligent. Protect its speed.
- The **honest search log** with the literal query, the real clock and the real stages. It earns trust with engineers.
- **The deal** as four plain terms, and dropping the strikethrough compare table and the logo strip. Both were right calls.
- The system: paper, ink, Newsreader, Geist and Geist Mono, one ultramarine reserved for "you". No stock photos, no gradients, no hands. Keep the restraint.
- **The optional-resume path** ("No resume handy? We'll work from your LinkedIn.") and the visible **"represented until May 4, 2027"**. A date is a promise a person can hold us to.
- "We only read your public profile." and the FAQ answer to "Will my company find out?".

## 5. One bold move

**Show them the email, before we ask for anything, and let them sharpen it in one line.** Owners: BACKEND + FRONTEND.

Move the pitch from the end to the moment they click "Yes, that's me". `/api/pitch` already fires there. Render it as the actual message a founder would get, with "To: a founder hiring for <their kind of role>", a subject line, and the pitch streaming in as it is drafted. Under it put one chip-question in Tal's voice: "What's the hardest thing you've shipped?" They type one sentence, and the pitch rewrites itself in about a second, now with their detail in it. Then comes the resume ask: "Want it sharper? Add your resume." That's optional, and it's a reward, not a toll.

That is the zero.university nerve done our way. It doesn't come from WebGL. The page does something for you, about you, live, and you get to steer it. An AI engineer sees an LLM used with taste, sees exactly how they'll be sold, and keeps control. That is the screenshot they send a friend.

Backend: add an optional `answer` fact to `/api/pitch`, vetted like every other fact, and return `needsMore` from fix 1 so the question only appears when it adds something. Frontend: an email-format card, the streamed or typed reveal you already have, one input, and reduced-motion respected.

*Founder-level note, not a team fix:* "We have raised $7 million from Sequoia." Many SF engineers know Sequoia India became Peak XV in 2023. If that's the source, an SF reader who checks may see the line as inflated. It's verbatim per the brief; the founder should decide.
