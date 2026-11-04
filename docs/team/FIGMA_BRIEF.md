# Phase 1 brief: Tal US v4 screens in Figma, max precision

File: **Tal US · v4** `QjHT7mWSNvgeAuiQehZZNJ` (https://www.figma.com/design/QjHT7mWSNvgeAuiQehZZNJ). Session id for all Figma tool calls: `c6863a3e-dbcf-42d4-a2e1-177ed8f0c87c`. Read `MEGA_PLAN.md` and `DS_TOKENS.md` first. Reference screenshots of the founder's system are in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/ds/` (select-landing-v2.png, subbrand-select.png, visual-language.png, onb-a3-name.png, onb-a6-linkedin.png, cover.png).

## Non-negotiables
- Everything comes from the Tal Web Design System: black & white, Inter (the file uses SF Pro; use **Inter** in Figma, Medium/Regular/Semibold, with the DS sizes), pill buttons, glass cards, the one-question-per-screen onboarding anatomy, the 88px header/footer, segmented 2px progress. No serif anywhere. No colour except black, white, the silver ramp and the metallic wordmark gradient.
- Import real components from the Boss Design System library by key (`figma.importComponentSetByKeyAsync`): Button `f5e134ed04dbc4952b7feca4cc33341e156de0b9`, Input / Hero Field `81c17311df07e6e1b2e26e8ca01e237073cb99de`, tal logo v2 `7029d544abccee3626b318e81c22873104f6ebf3`, Icon Button `ccd4754b77e06ddd3652e90986bd0c837ca96979`. If an import fails, rebuild the component locally to the exact DS spec in DS_TOKENS.md and name it `DS/…`.
- Images: only the AI-generated monochrome stills in `talboss-sf/docs/team/art/round2/` (wait until `log.txt` ends with DONE; 16x9 and 4x5 variants per motif) and round1/. Upload with the `upload_assets` tool (count N, POST bytes with `Content-Type: image/png`, `nodeIds` to set as fills on prepared rectangles). No stock, no people, no logos as hero imagery.
- Copy: use the interim lines below; the copywriter's final lines will replace them in code, not in Figma.
- No letter / pitch / "how we'd introduce you" step. No work authorization.
- Tal is "Tal"/"it"; the page speaks as "we".

## Pages to create
1. `01 Landing · 1440` and `02 Landing · 390`
2. `03 Flow · 1440` (A1 Name, A2 Company, A3 Title, A4 Finding you on LinkedIn, A5 Is this you?, A5b Not found / Rate limited / Daily cap, A6 Resume (optional), A6b No resume → email, A7 Done)
3. `04 Flow · 390` (same)
4. `05 Prototype` notes: wire A1→A7 with Figma prototype links (on-click Continue) so the founder can press Play.

## Landing (dark, Select-v2 anatomy with the v4 soul)
Top nav: metallic "tal" wordmark (silver gradient) left; right: outline pill "Questions?" and white pill "Ask Tal to represent you". Funding line small under nav right or in footer: "We have raised $7 million from Peak XV (formerly Sequoia Capital)."
1. Hero: full-bleed generated still (fog-hill or chair-window 16x9) with a black-to-transparent scrim; centred H1 56/64 Semibold white: "Talent." then sub 18/28 rgba(255,255,255,.72): "Tal is a talent agent for engineers, researchers, PMs and designers. Now opening in San Francisco." White pill CTA "Ask Tal to represent you", below it 13px "Free for you. Companies pay when they hire."
2. Glass chat card (DS pattern): a thread showing what Tal does — "Tal · Found 3 roles that fit you this week" / your reply "Yes to Stripe, no to the other two" / "Tal · Intro sent to the founder. They'll reply here." (clearly an illustration, no real company logos; use "a Series B payments company").
3. White rounded card (radius 28): "Built on India's fastest hiring network" style block → for the US: headline "Behind Tal", 4 stats with hairlines: "300,000+ tech professionals", "5,000+ AI and consumer startups", "6 months of representation", "0 fees for you"; and one 4x5 still at right instead of phones.
4. Numbered section "How it works" (01/02/03/04, hairline dividers, left title + right list): Tell Tal who you are → Tal finds your LinkedIn → Tal emails you roles that fit → You say yes, Tal makes the intro.
5. The terms as a short dark card: free; we ask first; six months until <date>; delete on request.
6. Questions (6 rows, hairline accordion).
7. Footer: giant metallic "tal" wordmark cropped at the bottom (Select-v2), small links Privacy · Terms · support@gvine.app.

## Flow screens (white, DS onboarding anatomy, exact numbers in DS_TOKENS.md)
- A1 "What's your full name?" sub "This is the name we'll represent." Hero Field (Typing: "Aryan|"), black pill Continue, "or press ⏎ to continue".
- A2 "Where do you work?" sub "Company name is enough."
- A3 "What's your title?" sub "Member of Technical Staff, Staff Engineer, Product Lead…"
- A4 "Finding you on LinkedIn" with the DS visual (LinkedIn tile + magnifier), 320×6 progress + "48%", "This usually takes about 15 seconds." Secondary text link: "Paste my LinkedIn link instead".
- A5 "Is this you?" DS profile card: 72px photo, name 20 Medium, headline 16 #6A6A6A, 3 experience rows with 28px logos + duration right; two pills: outline "No, not me" + black "Yes, that's me"; text link "Paste my link".
- A5b states: Not found ("We couldn't find you on LinkedIn" + paste link primary + "Skip, I'll add my resume"); Rate limited ("Tal is getting a lot of requests from your network"); Daily cap ("Tal's LinkedIn search is full for today. Try again tomorrow.").
- A6 "Add your resume" sub "Optional. It helps Tal pitch you better." dashed hairline drop area 560×160 with "Drop a PDF or DOCX, or click to choose", black pill "Continue", text link "No resume handy? We'll work from your LinkedIn."
- A6b "Where should Tal write to you?" Hero Field (email), Continue.
- A7 Done: full-bleed generated still (train-rain or dawn-city) with scrim; centred white: name 56/64 Semibold "Aryan Mehta", 13px tracked caps "REPRESENTED BY TAL · UNTIL 4 MAY 2027", sub 16: "Tal reads your profile tonight. When a role fits, you'll get an email. Nobody hears your name until you say yes." Outline pill "Done".
- Footer progress: 5 segments across A1–A6; header outline pill "Questions?".

## Mobile 390
Same, 24px padding, question 28/34, CTA pinned bottom, progress under header. Landing hero still at 4x5.

## Output
- All frames named exactly as above, in auto-layout, pixel-exact to the tokens.
- A `00 Contact sheet` page with every frame placed at 25% for review, and screenshots of each page saved via get_screenshot to `docs/team/figma-shots-v4/`.
- `docs/team/FIGMA_BUILD.md`: node ids of every frame, what was imported vs rebuilt, open questions.
