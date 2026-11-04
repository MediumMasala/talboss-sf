# Tal US site: copy (v4)

Owner: copywriter. Source of truth: `content/site.ts`. v3's copy (the letter, the agent essays, the origin story and the sample letter) is gone. v4 is short and plain, with one line per screen, in the voice of the India onboarding, and it follows MEGA_PLAN.md and FIGMA_BRIEF.md.

## Key map

| Screen | Keys in `site` |
|---|---|
| Meta | `seo`, `select.seo`, `select.og` |
| Top nav / flow header | `select.topBar.wordmark`, `.questions`, `.cta`; `funding.line` |
| Sound toggle, mobile dock | `select.sound.*`, `select.dock` |
| L1 Hero | `select.hero.word`, `.sub`, `.cta`, `.note` |
| L2 Glass chat card | `select.chat.label`, `.tal`, `.you`, `.messages[]` |
| L3 Stats card | `select.stats.heading`, `.items[]`, `.origin` |
| L4 How it works | `select.how.heading`, `.steps[]` (title + body) |
| L5 Terms card | `select.terms.heading`, `.paragraphs(date)` |
| L6 Questions | `select.faq.heading`, `.items[]` |
| L7 Footer | `select.credits.*`, `funding.line`, `legal.supportEmail`, `legal.privacyUrl`, `legal.termsUrl` |
| Logo row caption (only if a row is shown) | `select.proofLine` |
| Progress bar | `select.steps.names`, `.label(n,total)` |
| Every question screen | `select.apply.continue`, `.enterHint` |
| A1 Name | `select.apply.name.*` |
| A2 Company | `select.apply.company.*` |
| A3 Title | `select.apply.title.*` |
| A4 Finding you | `select.apply.search.*` |
| Paste-link screen | `select.apply.link.*` |
| A5 Is this you? | `select.apply.confirm.*` |
| A5b states | `select.apply.notFound`, `.rateLimited`, `.dailyCap`, `.searchDown`, `.offline` |
| A6 Resume | `select.apply.resume.*`, `upload.idle`, `upload.errors`, `upload.consent` |
| A6b Email | `select.apply.noResume.*` |
| A7 Done | `select.apply.done.credit(date)`, `.sub`, `.places`, `.roles` (v4.1: each chip becomes its role line), `.email(email)`, `.close` (`.noEmail` removed in v4.1: no email routes to A6b) |
| Claims | `claims.network`, `claims.startups`, used once each in `select.stats.items` |

## Deleted in v4
- Every letter, pitch, needsMore and email-card key: `apply.email.*` (To/From/Subject, signature, send note, drafting, the question, rewrite and highlight lines), `done.pitch`, `sample`, and `agent`.
- `origin`, the network sentence and the contact-sheet caption. The Sarvam fact moved, once, to `stats.origin`.
- `you` (split into `name`, `company`, `title` and `link`), `search.stages`, `search.srLabel`, `search.skip`, the photo-credit keys and `hero.alternates`.
- Work authorization: there are no keys for it anywhere.

## For the frontend engineer: tsc is NOT clean
`npx tsc --noEmit` shows 43 errors. All of them are in the v3 components, which v4 replaces and which I don't own:
- `components/tal/Stage.tsx` (31): reads `apply.email`, `apply.you`, `search.stages`, `search.srLabel`, `search.skip`, `notFound.body` / `rateLimited.body`, `resume.hint`, `resume.sending.map` (now a string) and `done.next(...)` (now a string).
- `components/tal/Sections.tsx` (12): reads `agent`, `sample`, `origin`, `apply.email` labels, `credits.photo`, `credits.photosLabel` and `terms.signature`.

Nothing outside those two files breaks: app, lib and `Controls.tsx` are fine. Fix it by rebuilding them on the v4 keys above. Restoring the deleted keys would bring the cut letter copy back, so I didn't. Also:
- `done.credit(date)` returns sentence case ("Represented by Tal · until 4 May 2027"). Set it in tracked caps with CSS.
- `terms.paragraphs(date)` and `done.credit(date)` take the same computed date.
- `chat.messages` is an illustration and names no real company. Keep `chat.label` ("An example") visible.

## The copy, in screen order

### Meta
- Title: Tal: a talent agent for engineers, researchers, PMs and designers
- Description: Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.
- OG: **Talent.** / Tal is a talent agent, now opening in San Francisco.

### Nav
tal · [Questions?] · [Ask Tal to represent you] · We have raised $7 million from Peak XV (formerly Sequoia Capital).

### L1 Hero
- **Talent.**
- Tal is a talent agent for engineers, researchers, PMs and designers, now opening in San Francisco.
- [Ask Tal to represent you]
- Free for you. Companies pay us when they hire someone we introduced.

### L2 Chat card (labelled "An example")
- Tal: Found 3 roles that fit you this week.
- Tal: Staff engineer, Series B payments company, San Francisco.
- You: Yes to the payments one. No to the other two.
- Tal: Intro sent to the founder. They'll write to you directly.

### L3 Behind Tal
- 300,000+ tech professionals in our network · 5,000+ AI and consumer startups · 6 months of representation · $0 in fees for you
- Tal is built in Bengaluru by the team behind Grapevine and Round1. An engineer Round1 placed at Sarvam AI went on to become its CTO.

### L4 How it works
01. **Tell Tal who you are.** Your name, company and title. It takes a minute.
02. **Tal finds your LinkedIn.** You confirm it's you. A resume is optional.
03. **Tal emails you roles that fit.** One role at a time, in San Francisco, the Bay Area, or remote.
04. **You say yes, Tal makes the intro.** Nobody hears your name until you say yes.

### L5 The terms
- Free for you. Companies pay us when they hire someone we introduced.
- We ask you before your name goes to anyone.
- We represent you for six months, until {date}. Then we ask if you'd like us to keep going. If we don't hear back, we stop.
- Ask at support@gvine.app and we'll delete your profile and resume.

### L6 Questions
1. **Where are the roles?** In San Francisco, the Bay Area, and remote.
2. **I'm not looking right now. Should I sign up?** Yes. You keep your job, and we only email you when a role fits.
3. **Will my company find out?** Not from us. Your name goes to a company only after you say yes to that role.
4. **How will I hear from Tal?** By email, one role at a time. You reply yes or no.
5. **What does it cost?** Nothing. Companies pay us when they hire someone we introduced.
6. **What happens after six months?** We ask if you'd like us to keep going. If you don't reply, we take it you're not looking right now, and we stop.

### L7 Footer
[Ask Tal to represent you] · Made in Bengaluru by the team behind Grapevine · Privacy · Terms · support@gvine.app · funding line

### Flow (every question screen: [Continue] · "or press Enter to continue"; progress: Name, Company, Title, LinkedIn, Resume)
- **A1** What's your full name? / This is the name we'll represent. / [Your full name] / error: Add your full name to continue.
- **A2** Where do you work? / Company name is enough. / [Company] / error: Add where you work to continue.
- **A3** What's your title? / Member of Technical Staff, Staff Engineer, Product Lead… / [Member of Technical Staff]
- **A4** Finding you on LinkedIn / {stage: Searching LinkedIn… → Looking through people named {first name}… → Reading the profile… → Checking it's you…} / This usually takes about 15 seconds. / Paste my LinkedIn link instead
- **Paste link** What's your LinkedIn link? / [linkedin.com/in/your-name] / error: That isn't a LinkedIn profile link. It looks like linkedin.com/in/your-name.
- **A5** Is this you? / We only read your public profile. / [No, not me] [Yes, that's me] / Paste my link / Checking the next profile / after three: That's everyone we found. Paste your LinkedIn link instead.
- **A5b not found** We couldn't find you on LinkedIn / Paste your LinkedIn link and we'll take it from there. / [Paste my LinkedIn link] · Skip, I'll add my resume
- **A5b rate limited** Tal is getting a lot of requests from your network / Paste your LinkedIn link to keep going.
- **A5b daily cap** Tal's LinkedIn search is full for today / Paste your LinkedIn link to keep going, or try again tomorrow.
- **A5b search down (502)** Tal's LinkedIn search isn't working right now / Paste your LinkedIn link to keep going.
- **Offline** You're offline / Check your connection and try again. / [Try again] · Paste my LinkedIn link
- **A6** Add your resume / Optional. It helps Tal represent you better. / Drop a PDF or DOCX, or click to choose (touch: Tap to choose a PDF or DOCX) / [Continue] / Saving your resume / No resume handy? We'll work from your LinkedIn. (No LinkedIn: No resume handy? Your email is enough to start.)
- **A6b** Where should Tal write to you? / We'll email you when a role fits. (After a resume with no email on it: Your resume is saved, but there's no email on it. We'll write to you when a role fits.) / [you@example.com] / Add your email to continue. / That email doesn't look right. / [Continue] / Add a resume instead
- **A7** {Full name} / Represented by Tal · until 4 May 2027 / We'll read your profile and start looking for roles that fit. When one does, we'll email you at {email}. Nobody hears your name until you say yes. / [Done]
- Upload errors: That's a .png file. Please use a PDF or DOCX. · That file is 7.2 MB. The limit is 5 MB. · That file is empty. Try another one. · We couldn't open that file. Try saving it again as a PDF. · One file at a time, please. · We couldn't reach Tal. Check your connection and try again. · Something went wrong on our side. Please try again in a minute. · That file is too big to upload. A PDF under 4 MB will work.

## Choices made
- Done says "We'll read your profile…", not the interim "tonight", because that would be a time promise nobody has confirmed.
- A6 says "represent you better", not "pitch you better", since the pitch step is cut.
- Claims and founder answers are as before. The Sarvam fact appears once (`stats.origin`), each number appears once, the roles wording is "San Francisco, the Bay Area, and remote", the six-month line has the exact date, and deletion is "ask and we'll delete your profile and resume".
- Still open for the founder: does deletion also cover the sheet and the cache?

## Banned-pattern grep

Command: `grep -nEi "every time|one job|not [^."]* but|—|–|\b(he|him|his)\b|tal select|work.?auth|interview|candidate|\bapply\b|talent pool|\bmatch|unlock|seamless|game.changer|supercharge|your yes|that's it|no catch|got you|keep building|pitch|letter|introduce you|senior software engineers" content/site.ts docs/team/COPY.md`. Every hit is a key name (`apply`) or a note in this file describing what was deleted. None is user-facing copy.

```
docs/team/COPY.md:3:Owner: copywriter. Source of truth: `content/site.ts`. v3's copy (the letter, the agent essays, the origin story and the sample letter) is gone. v4 is short and plain, with one line per screen, in the voice of the India onboarding, and it follows MEGA_PLAN.md and FIGMA_BRIEF.md.
docs/team/COPY.md:21:| Every question screen | `select.apply.continue`, `.enterHint` |
docs/team/COPY.md:22:| A1 Name | `select.apply.name.*` |
docs/team/COPY.md:23:| A2 Company | `select.apply.company.*` |
docs/team/COPY.md:24:| A3 Title | `select.apply.title.*` |
docs/team/COPY.md:25:| A4 Finding you | `select.apply.search.*` |
docs/team/COPY.md:26:| Paste-link screen | `select.apply.link.*` |
docs/team/COPY.md:27:| A5 Is this you? | `select.apply.confirm.*` |
docs/team/COPY.md:28:| A5b states | `select.apply.notFound`, `.rateLimited`, `.dailyCap`, `.searchDown`, `.offline` |
docs/team/COPY.md:29:| A6 Resume | `select.apply.resume.*`, `upload.idle`, `upload.errors`, `upload.consent` |
docs/team/COPY.md:30:| A6b Email | `select.apply.noResume.*` |
docs/team/COPY.md:31:| A7 Done | `select.apply.done.credit(date)`, `.next`, `.email(email)` / `.noEmail`, `.private`, `.close` |
docs/team/COPY.md:35:- Every letter, pitch, needsMore and email-card key: `apply.email.*` (To/From/Subject, signature, send note, drafting, the question, rewrite and highlight lines), `done.pitch`, `sample`, and `agent`.
docs/team/COPY.md:38:- Work authorization: there are no keys for it anywhere.
docs/team/COPY.md:42:- `components/tal/Stage.tsx` (31): reads `apply.email`, `apply.you`, `search.stages`, `search.srLabel`, `search.skip`, `notFound.body` / `rateLimited.body`, `resume.hint`, `resume.sending.map` (now a string) and `done.next(...)` (now a string).
docs/team/COPY.md:43:- `components/tal/Sections.tsx` (12): reads `agent`, `sample`, `origin`, `apply.email` labels, `credits.photo`, `credits.photosLabel` and `terms.signature`.
docs/team/COPY.md:45:Nothing outside those two files breaks: app, lib and `Controls.tsx` are fine. Fix it by rebuilding them on the v4 keys above. Restoring the deleted keys would bring the cut letter copy back, so I didn't. Also:
docs/team/COPY.md:118:- A6 says "represent you better", not "pitch you better", since the pitch step is cut.
content/site.ts:197:    apply: {
```
