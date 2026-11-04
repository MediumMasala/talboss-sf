# Steve, round 2

**What I looked at:**
- BRIEF.md, including the founder's decisions: Tal is the agent, no named humans, and the Peak XV line;
- PITCH_SAMPLES.md;
- the round-2 contact sheets;
- my own shots in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-r2/`: desktop 1440×900 for all 10 preview states plus full page and full done, and mobile 390×844 @2x for all 10 states plus full page;
- live `/api/pitch` calls on 5 fixtures (founder, ml-researcher, designer, frontend-mock, thin);
- a real founder-profile run in the browser.

**Live pitch vs the preview: they match.** The frontend-mock output is identical to `preview.ts`. The founder, Noor and Kwame drafts came back new but of the same quality as PITCH_SAMPLES.md, in 1.3–1.75 s uncached. Round 1's biggest problem is fixed.

## 1. VERDICT: FAIL (close; one short fix round, no redesign)

> "OK, that's a better intro than any recruiter has written about me, and it let me fix it in one line. But why are 'of' and 'the' highlighted in blue? And it told me it 'couldn't find me' when it was really rate-limiting my office."

This round moved a lot. The email card after "Yes, that's me" is the moment I asked for, and it lands for anyone with a real LinkedIn. I'd ship it once items 1–3 below are fixed and re-shot. I don't need a full round 3, only shots of those states.

## 2. Scores (round 1 in brackets)

| | /10 | Why |
|---|---|---|
| First impression | 7.5 (6) | "Now opening in SF", the readable dot line ("You're the blue one") and the black Tal point give the field meaning in about 5 s. The hero is still quiet rather than "cool". The cool arrives at step 3. |
| Trust | 7 (5) | Peak XV (formerly Sequoia Capital) reads as precise, not inflated. "You're early" is honest and appealing. The deal holds. The 429 dressed up as "couldn't find you" is the one lie left on the page (item 1). |
| Copy | 8 (7) | "Draft my intro", "Represent me", "Want it sharper? Give Tal your resume." All payoff, no plumbing. Each number appears once. Small misses are in item 4. |
| Design and taste | 8 (7) | The To / From / Subject card is the right object, set beautifully in Newsreader. The word-level blue diff is the one ugly thing (item 2). |
| Flow | 7 (7) | The order is now right: found → email → sharpen → resume as a reward → done. Lookup was 3.1 s on a warm cache. Rate limiting broke my second real run. On the pitch step the primary button falls below the 900 px fold. |
| The AI moment | 7.5 (3) | Rich profiles come out at an 8: Tomás's "140 services… 40 minutes to 6" and Noor's execution-signal reward models are things a founder would forward. The thin path is honest: a one-line fallback plus a question, which works. The closing sentence is still a formula (item 3). |
| Mobile | 7.5 (6) | The first input sits above the fold and every step scrolls to the top of the card. The email card reads well at 390 px. The funding line wraps to two lines beside the wordmark. |

## 3. Must-fix list (ranked)

1. **BACKEND + FRONTEND + COPY: the rate limit must not block real ad traffic, and must not lie.** It is 6 lookups per IP per hour, and cache hits count (API.md). A LinkedIn ad that lands inside one SF office shares one egress IP, so the 7th colleague is blocked. The card then says **"Tal couldn't find you."** over a body that admits it was a rate limit (`flow-3-confirm.png`).
   - BACKEND: cache hits don't count; raise the per-IP limit to 30/h or more; add a per-IP + name-hash limit (about 3/h) and a global daily Apify spend cap as the real cost guard; return a distinct `code:"rate_limited"`.
   - FRONTEND + COPY: give rate limiting its own title, for example "Tal is getting a lot of requests from your network.", with the paste-link button as the primary action.
   - *Fixed =* 10 lookups from one IP with different names all work. A forced 429 shows a title that never says "couldn't find you".

2. **FRONTEND: the sharpened diff highlights words, not the new idea.** In `?preview=sharpened`, "of", "the", "stack", "actually", "features" and "builder" are all ultramarine. It looks like a broken word diff, and it lands at the exact moment we want the engineer to admire our craft.
   - Highlight only the spans that carry the answer's content: contiguous runs of 2+ words, never stopwords alone. Or put one soft underline on the sentence that's new.
   - *Fixed =* the sharpened shot has at most 2 highlighted spans, both traceable to the typed answer, and no highlighted stopword.

3. **BACKEND: kill the closing formula.** In all 9 samples the third sentence is "A team building X gets a Y who Z." When it's weak it's the weakest line on the card: "prioritizes performance and measurable output over hype", "components that actually work", "snappy production systems", "builds models for the real world".
   - Add "actually", "over hype", "snappy", "real world" and "production-ready" to the vet.
   - Allow two sentences when the third would be opinion, and vary the close. For example, name the kind of problem rather than the kind of team.
   - Use singular "they" sparingly: "Jordan is… They focus…" reads translated. Restructure so a second subject isn't needed.
   - *Fixed =* across the 9 fixtures, at most 3 drafts use the "gets a" frame and none contains a banned word. The latency budget holds.

4. **COPY: make every line on the email card true.**
   - The `needsMore` line "Tal only has your title so far." is false once LinkedIn is confirmed: Jordan's card had a headline and three jobs. Use two strings: thin ("Tal only has your title so far.") and LinkedIn-only ("Tal only has your LinkedIn so far."), each followed by "One line from you changes that."
   - "From: Tal, Tal Select" stutters. Make it "Tal · Tal Select" or just "Tal".
   - *Fixed =* the confirmed-LinkedIn pitch state never says "only your title".

5. **FRONTEND: the primary action must be visible on the pitch step.** At 1440×900 the needsMore box pushes the black "Looks good as is" button to y≈883, so it's half cut off. On mobile it's a full screen below.
   - Desktop: tighten the card, for example by putting the needsMore line inline with the question, so the button sits above 860 px.
   - Mobile: make "Looks good as is" a sticky bottom bar while the pitch step is open.
   - *Fixed =* the button is fully visible without scrolling on `d-pitch` at 1440×900 and on `m-pitch` at 390×844.

6. **FRONTEND: on mobile, the funding line goes on one line, or out of the nav.** At 390 px "We have raised $7 million from Peak XV (formerly Sequoia Capital)." wraps to two lines beside the wordmark and crowds it. Keep the exact wording (brief), but move it on mobile to sit under the hero sub as a single quiet line.
   - *Fixed =* the mobile nav is one row: wordmark plus nothing, or plus "Join".

7. **COPY: don't say the same sentence twice.** "Tal is a talent agent for top professionals" opens the hero sub and the Meet Tal section, word for word. Let Meet Tal open on what's new to the reader: "An AI agent with a human team behind him. He reads every profile, finds the roles that fit, and emails them to you."
   - *Fixed =* the phrase appears once on the page.

## 4. Keep (do not lose these)

- **The email card**: To / From: Tal / Subject, typed out right after "Yes, that's me", with the draft tag and "goes out only after you say yes to a role". This is the product's best moment. Don't move it back to the end.
- **One sharpening question** ("What's the hardest thing you've shipped?"), the "Rewrite it" button, "Looks good as is" as a no-pressure exit, and the honest `needsMore` gating. The thin+answer sample ("rebuilt the webhook retry system… stop missing events during outages") shows the loop works.
- **The pitch engine's vet**: no invented numbers or names, no tails, the hedged second call, p95 1.6 s, and a template only as the last resort. The preview now shows live output. Keep it that way forever.
- "Want it sharper? Give Tal your resume." The resume as a reward, not a toll. Also "No resume handy? Tal will work from your LinkedIn."
- "Draft my intro", "Represent me", "Join Tal Select". No "application" on any button.
- **The done screen**: "You're early. Tal's first US intros go to the first members.", the dashed lines captioned "your first intros, when you say yes", no stale pre-apply copy, no second CTA, the date, the email, "Free for you."
- **The field**: the black Tal point between you and the startups, and "Each dot is 30 people in the Tal network. You're the blue one." No count-up.
- The Peak XV wording, the deal, the FAQ ("Will my company find out?"), the paper / ink / Newsreader / Geist system, the single ultramarine, the "Member of Technical Staff" placeholder, the literal search log, and the "Is this you?" card.

*Founder-level note, not a team fix:* the brief locks "he/his" for Tal. Some SF AI engineers will find a gendered AI agent a little off. If the founder ever revisits it, "Tal and the team" reads cleanly with no pronoun at all. The page doesn't need one.
