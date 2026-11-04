# Tal US site: copy (v3)

Owner: copywriter. Source of truth: `content/site.ts`. This file records every string, where it appears and why it's worded that way. v2 copy is gone in full.

## Key map

| Where on the page | Key in `site` |
|---|---|
| Meta (layout, page, social card) | `seo`, `select.seo`, `select.og` |
| Top bar | `select.topBar.wordmark`, `funding.line` |
| Sound toggle (fixed, bottom-left) | `select.sound.*` |
| Mobile dock / after-hero action | `select.dock` |
| 1. Opening frame | `select.hero.word`, `select.hero.sub` |
| Step counter (mono) | `select.steps.label(n,total)`, `select.steps.names` |
| 1. Form card | `select.apply.you.*` |
| 2. Finding you | `select.apply.search.*` (use `stages`, not `lines`) |
| Error screens | `select.apply.notFound`, `.rateLimited`, `.dailyCap`, `.searchDown`, `.offline` |
| 3. Is this you? | `select.apply.confirm.*` |
| 4. The letter | `select.apply.email.*` |
| 5. Resume | `select.apply.resume.*`, `select.apply.noResume.*`, `upload.idle`, `upload.errors`, `upload.consent` |
| 6. Done title card | `select.apply.done.credit(date)`, `.next(first)`, `.email(email)` / `.noEmail`, `.private` |
| 7. What an agent does | `select.agent.label`, `select.agent.paragraphs[0..2]` |
| 8. Sample letter | `select.sample.*` |
| 9. Where we come from | `select.origin.*` |
| 10. Terms letter | `select.terms.*` (`paragraphs(date)` is a function) |
| 11. Questions | `select.faq.*` |
| 12. End credits | `select.credits.*`, `funding.line`, `legal.supportEmail` |
| Logo row caption | `select.proofLine` (the logo files and list belong to the frontend) |
| Claims (never inline a number) | `claims.network` and `claims.startups`, each used once, in `origin.network` |

Round 1 fix 8 (4 Nov 2026): every DEPRECATED v2 key, the legacy `/v2` and `/drop` keys (`hero`, `light`, `howItWorks`, `upload.matching/done/elsewhere/uploadError`), the `TeamMember` type and the old logo list (`proof.brands`) are deleted. `grep -c DEPRECATED content/site.ts` returns 0, and `tsc --noEmit` is clean; no component broke.

## Notes for the frontend engineer

- **Subject line:** `email.subject(name, title, company)` takes the **full name** ("Ana Ruiz, staff engineer at Stripe").
- **Search:** use `search.stages[stage]` with Math.max on the index.
- **Letter intro line:** `email.intro` ("Change anything that isn't right") only if the letter is editable in place; otherwise `email.introReadOnly`.
- **Credit line and terms:** `done.credit(date)` uppercases the date itself; `terms.paragraphs(date)` needs the same computed date.
- **Logo row:** `select.proofLine` is the only logo copy left in `site.ts`. Any logo shown must be one logged in ASSETS.md, and the row sits beside the Bengaluru story so it can't read as US openings.
- **Unused but kept:** `select.og` (source text for `app/opengraph-image.alt.txt`), `seo.ogAlt`, `email.intro`, `hero.alternates` (founder reference, never rendered) and `upload.idle.button`.

## Naming, voice and claims (how every line was tested)

- The brand and sender is **Tal**. The page speaks as **we**. Tal has no pronoun. The old programme name is in no string, comment or meta tag.
- AI is mentioned once, in `agent.paragraphs[0]`: "We use AI to read every profile and role, day and night, and people on our team decide who should meet whom." ("AI companies" in `origin` is a fact about Round1's clients, not about us.)
- Claims used: the funding line (top bar and credits, from one constant); 300,000+ and 5,000+ once each (`origin.network`); the Sarvam CTO fact once (`origin.body`); roles in "San Francisco, the Bay Area, and remote" (meta description and FAQ 1); free for you and companies pay when they hire (`terms` and one FAQ); we ask first; six months as a real date; the Grapevine → Round1 → Tal story; about 20 people in Bengaluru.
- Left out on purpose: any other Sarvam claim; any time promise ("tonight", "within a day").
- Every line was read aloud. Anything that sounded like a landing page was cut.

## The copy, in flow order

### Meta
- `seo.title` / `select.seo.title`: **Tal: a talent agent for engineers, researchers, PMs and designers**
- `seo.description` / `select.seo.description`: Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.
- `select.og.line`: **Talent** · `og.sub`: Tal is a talent agent, opening in San Francisco now. · `og.alt`: The word Talent set over a photograph, with the line: Tal is a talent agent, opening in San Francisco now.
- Why: the title names who it's for and avoids the sentence Dex owns. The description is the hero in three plain sentences.

### 0. Top bar and fixed controls
- `select.topBar.wordmark`: tal (lowercase, display serif) · `wordmarkLabel`: Tal, home
- `funding.line`: We have raised $7 million from Peak XV (formerly Sequoia Capital).
- `select.sound.off` / `.on`: SOUND OFF / SOUND ON · aria: Turn sound on / Turn sound off
- `select.dock`: Ask Tal to represent you

### 1. Opening frame
- `select.hero.word`: ***Talent***
- `select.hero.sub` (pick): That's what we call the people we represent. Tal is a talent agent for engineers, researchers, PMs and designers, and we're opening in San Francisco now.
- Alternates, ranked (`hero.alternates`, never rendered):
  2. In film, that's the word for the people in front of the camera, and every one of them has an agent. Tal is a talent agent for engineers, researchers, PMs and designers, opening in San Francisco now.
  3. That's what we call the people we represent. We read their work, find the founder who should meet them, and ask before we say their name. Tal is opening in San Francisco now.
- Why the pick: the first sentence explains the big word without a lecture, and the second says who we are, who it's for and where, plainly. Alternate 2 is lovely but explains the metaphor; the image should do that.

### 1. The form card
- Live title line before typing (`you.nameEmpty`): *Your name* (crossfades to their typed name in the serif)
- Mono credit under it (`you.credit`): REPRESENTED BY TAL
- Intro (`you.hint`): Tell us your name and where you work. We'll find you on LinkedIn and write the note we'd send a founder about you.
- Fields (`you.fields`): Full name [Your full name] · Company [Where you work now] · Title [Member of Technical Staff]
- Primary (`you.cta`): **Find me on LinkedIn** · Secondary (`you.manual`): Paste my LinkedIn link instead
- Paste path: label `manualLabel` "Your LinkedIn link", placeholder `manualPlaceholder` "linkedin.com/in/your-name", button `manualCta` **Use this link**
- Errors: `you.missing` "We need your full name and where you work to find you." · `you.badUrl` "That doesn't look like a LinkedIn profile link. It should look like linkedin.com/in/your-name."
- Step counter: `steps.label(2,4)` → STEP 2 OF 4 · `steps.names`: YOU, LINKEDIN, THE LETTER, RESUME
- Why: the button says exactly what happens next. "Draft my intro" (v2) promised the letter before we'd found them.

### 2. Finding you
- `search.stages.search`: Looking for you on LinkedIn
- `search.stages.people`: Going through the profiles with your name
- `search.stages.profile`: Reading your profile
- `search.stages.found`: Getting it ready for you to check
- Slow (`search.wait`): This usually takes about 15 seconds.
- `search.skip`: Skip this and add my resume
- Why: each line is what the API is really doing at that stage (API.md: `people` = the people search is running). No percentages.

### Error screens (body leads with pasting the link; the primary button is `manual`)
- **Not found** (`notFound`): We couldn't find you on LinkedIn. / Some profiles don't show up in search. Paste your link and we'll read it from there, or skip this and we'll work from your resume. / [Paste my LinkedIn link] · Skip this and add my resume
- **Rate limited** (`rateLimited`, code `rate_limited`): We've had a lot of searches from your network this hour. / Paste your LinkedIn link and we'll carry on from there. Or skip this, and we'll work from your resume.
- **Daily cap** (`dailyCap`, code `daily_cap`, a global per-day counter that resets daily): We've done all the LinkedIn searches we can for today. / Paste your LinkedIn link and we'll carry on from there. Or try again tomorrow, or skip this and we'll work from your resume.
- **Search down** (`searchDown`, HTTP 502): Our LinkedIn search isn't working right now, and that's on our side. / Paste your LinkedIn link and we'll try it that way. Or skip this, and we'll work from your resume.
- **Offline** (`offline`, 503 or no network): You seem to be offline. / When you're back, try again or paste your LinkedIn link. Everything you typed is still here. / [Try again] · [Paste my LinkedIn link]
- Why: only not-found says we couldn't find them. The others give the real reason in one line and take the blame where it's ours. Offline leads with "try again" because pasting a link needs a connection too.

### 3. Is this you?
- `confirm.title`: **Is this you?** · `confirm.hint`: We only read your public profile.
- Buttons: `yes` Yes, that's me · `no` No, not me · `manual` Paste my link
- Trying again (`confirm.trying`): Looking at the next profile with your name
- After three (`confirm.outOfProfiles`): That's everyone we found with your name. Paste your LinkedIn link and we'll start from that.

### 4. The letter
- Above it (`email.intro`): This is how we'd introduce you. Change anything that isn't right. (Read-only fallback `email.introReadOnly`: This is how we'd introduce you to a founder.)
- Header: To `email.toLine` "A founder in San Francisco" · From `email.from` "Tal" · Subject `email.subject(name,title,company)` "Ana Ruiz, staff engineer at Stripe"
- While drafting (`email.drafting`): Writing your letter · Tag (`email.draftTag`): DRAFT
- Signature (`email.signature`): Tal, a talent agent
- Under the signature (`email.sendNote`): **We'll only send this to a founder you've agreed to meet.**
- Fallback draft (`email.fallbackNote`): This first draft comes from your title alone. We'll write a better one once we've read your profile.
- needsMore lead-in: `needsMoreThin` "So far we only know your title." / `needsMoreLinkedIn` "So far we only know what's on your LinkedIn."
- The question (`email.question`): **What's one thing you've built that you'd want a founder to hear about?**
- Answer: placeholder "A sentence or two is plenty." · button `submit` "Add it to the letter" · while working `rewriting` "Adding it to the letter" · after `rewritten` "We've added that in." · sr-only label on the highlight `highlightLabel` "From your answer" · exit `keep` "Looks good as it is" · error "We couldn't rewrite it just now. Please try once more."
- Why: the send note states the rule as a fact about the letter, without the banned possessive shape from v2. The question asks what an agent needs to sell them, and "built" covers engineers, PMs and designers alike.

### 5. Resume (optional)
- `resume.title`: Want it sharper? Add your resume. · `resume.hint`: PDF or Word file, up to 5 MB. The more we read, the better we can introduce you.
- Drop zone: `resume.drop` "Drop it here, or choose a file" · `upload.idle.button` "Choose a file" · `upload.idle.dragging` "Let go to add it"
- Button (`resume.cta`): **Ask Tal to represent me** · Sending (`resume.sending`): Saving your details → Putting it with your profile → One moment
- Quiet path (`noResume.link`): No resume handy? We'll work from your LinkedIn. (`linkNoLinkedIn` when LinkedIn was skipped: No resume handy? Your email is enough to start.)
- `noResume.title`: Where should we write to you? · `noResume.hint`: We'll email you when there's a role worth your time, and you tell us yes or no.
- Email: label "Email", placeholder "you@example.com", missing "We'll need an email to write to you.", invalid "That email doesn't look right. Check it for a typo." · `noResume.cta` Ask Tal to represent me · `noResume.back` Add a resume instead
- Consent (`upload.consent`): By continuing, you agree to our Privacy Policy and Terms.
- Upload errors (`upload.errors`): wrongType "That's a .png file. We need a PDF or a Word document (.docx)." · tooBig "That file is 7.2 MB, and the limit is 5 MB. Saving it as a PDF usually makes it smaller." · empty "That file looks empty. Try another one." · corrupt "We couldn't open that file. Try saving it again as a PDF." · multiple "One file at a time, please." · network "We couldn't reach our server. Check your connection and try again." · server "Something went wrong on our side. Please try again in a minute." · tooBigForServer "That file is too big for us to upload. A PDF under 4 MB will work."
- `upload.uploadError`: That didn't go through. / [Try again] [Choose another file]

### 6. Done: the title card
- Their name, in the display serif.
- `done.credit(date)`: REPRESENTED BY TAL · UNTIL 4 MAY 2027
- `done.next(first)`: Thank you, Ana. We'll read everything properly and start looking for roles worth your time.
- `done.email(email)`: When we find one, we'll write to you at ana@example.com. (No email: `done.noEmail` "We couldn't find an email on your resume, so we can't write to you yet. Add one to your resume and upload it again.")
- `done.private`: Nobody outside Tal hears your name until you say yes.
- Why: "outside Tal" keeps it true, since our team does read the profile.

### 7. What an agent does (`agent.label` WHAT AN AGENT DOES)
1. We read everything you give us, properly. We use AI to read every profile and role, day and night, and people on our team decide who should meet whom. When we describe you to a founder, it should sound like we know your work. (43 words)
2. Then we look for the role, and for the person who makes the call on it, usually a founder or the manager you'd work for. A short note from someone they trust gets read, and that's the note we write. (40)
3. When we find something, we email you about it: the company, the role, the person and why we think it's worth your time. If you say no, nobody hears your name. Say yes, and we make the intro and set up the conversation. (43)

### 8. Sample letter (`sample`)
- Label: SAMPLE · AN INVENTED PERSON, TO SHOW HOW WE WRITE
- To: A founder in San Francisco · From: Tal · Subject: Noor Halvorsen, staff engineer at Acme Freight
- Body: Noor leads routing at Acme Freight and rebuilt the dispatch system that plans every truck's day. Before that, Noor spent four years building the payments ledger at a regional bank.
- Signature: Tal, a talent agent
- Why: Acme is the universal invented company, so nobody reads this as a real member. Two plain facts, no pronouns and no closing judgement (Steve round 1, fix 6). It passes the backend's `vet()` unchanged: run against the same invented facts it returned `{ok:true}` with the text untouched.

### 9. Where we come from (`origin`)
- `heading`: Where we come from
- `body` (90 words): We started in Bengaluru with Grapevine, India's largest anonymous professional network, where more than a million verified professionals share real salaries and the truth about where they work. Then we built Round1, a hiring agency that became profitable placing engineers at India's fastest-growing AI companies. One engineer Round1 placed at Sarvam AI went on to become its CTO. Round1 taught us that the scarce thing in hiring is trust. A founder will make time for someone new when the note comes from people they believe. We built Tal on that.
- `network`: There are about 20 of us, and the network behind Tal is 300,000+ tech professionals and 5,000+ AI and consumer startups. (The only place either number appears.)
- Logo row caption (`select.proofLine`): **Bosses from these companies hire on Tal**. Founder's call (overrides DIRECTION §5). Put it beside the Bengaluru story, never under the SF hero, so it can't read as US openings.
- Contact sheet caption (`caption`): **People on Tal in Bengaluru**. These faces appear here and nowhere else, with no quotes beside them.

### 10. The terms (`terms`), a letter on paper, about 105 words
- Label: THE TERMS · Heading: What we're agreeing to
- It's free for you. Companies pay us when they hire someone we introduced. You never pay us anything.
- We ask before your name goes anywhere. Every role comes to you first, by email, and nobody outside Tal hears about you unless you say yes to it.
- We'll represent you for six months, until {date}. Then we'll ask if you want us to keep going. If we don't hear back, we'll assume you're not looking right now, and we'll stop.
- We use your LinkedIn profile and resume only to represent you. Ask at support@gvine.app and we'll delete your profile and resume.
- Signed: The Tal team, Bengaluru

### 11. Questions (`faq`)
1. **Where are the roles?** In San Francisco, the Bay Area, and remote.
2. **I'm happy where I am. Should I still sign up?** Yes, and it's a good time to. You keep your job, and we only write to you when a role looks worth your time.
3. **Will my company find out?** Not from us. Your name goes to a company only after you've said yes to that specific role.
4. **How will I hear from you?** By email, one role at a time. Each one says who the company is, what the role is and why we thought of you, and you reply yes or no.
5. **What does it cost?** Nothing. Companies pay us when they hire someone we introduced.
6. **What happens after six months?** We'll write and ask if you'd like us to keep going. If you don't reply, we'll take it that you're not looking right now, and we'll stop representing you.
- Cut to stay at six: "Who makes Tal?" (the origin section and credits cover it) and "What happens to my data?" (the terms letter says it). The company name is `legal.company`; show it in the credits.

### 12. End credits (`credits`)
- `cta`: **Ask Tal to represent you**
- `made`: Made in Bengaluru by the team behind Grapevine
- `photosLabel`: PHOTOGRAPHS · `photo(name, source)`: PHOTOGRAPH: JANE DOE / UNSPLASH (one per photographer, from ASSETS.md)
- `privacy` Privacy · `terms` Terms · `legal.supportEmail` support@gvine.app · `funding.line`

## Questions for the founder
All answered on 4 Nov 2026: Sarvam may be named once (the CTO fact); 5,000+ is approved; roles are San Francisco, the Bay Area, and remote; after six months with no reply we stop; the daily cap resets each day; deletion wording stays "ask and we'll delete your profile and resume". Still open: does deletion also cover the sheet and the cache?

## Banned-pattern grep (run on both files after the last edit)

Command: `grep -nEi "every time|one job|not [^."]* but|—|–|\b(he|him|his)\b|tal select|work.?auth|interview|candidate|\bapply\b|talent pool|\bmatch|unlock|seamless|game.changer|supercharge|your yes|that's it|no catch|got you|keep building|six months, then|senior software engineers|each dot|places most engineers" content/site.ts docs/team/COPY.md`

Every hit is an internal key or file name (`apply`) or a developer note. None is user-facing copy.

```
docs/team/COPY.md:15:| 1. Form card | `select.apply.you.*` |
docs/team/COPY.md:16:| 2. Finding you | `select.apply.search.*` (use `stages`, not `lines`) |
docs/team/COPY.md:17:| Error screens | `select.apply.notFound`, `.rateLimited`, `.dailyCap`, `.searchDown`, `.offline` |
docs/team/COPY.md:18:| 3. Is this you? | `select.apply.confirm.*` |
docs/team/COPY.md:19:| 4. The letter | `select.apply.email.*` |
docs/team/COPY.md:20:| 5. Resume | `select.apply.resume.*`, `select.apply.noResume.*`, `upload.idle`, `upload.errors`, `upload.consent` |
docs/team/COPY.md:21:| 6. Done title card | `select.apply.done.credit(date)`, `.next(first)`, `.email(email)` / `.noEmail`, `.private` |
docs/team/COPY.md:31:Round 1 fix 8 (4 Nov 2026): every DEPRECATED v2 key, the legacy `/v2` and `/drop` keys (`hero`, `light`, `howItWorks`, `upload.matching/done/elsewhere/uploadError`), the `TeamMember` type and the old logo list (`proof.brands`) are deleted. `grep -c DEPRECATED content/site.ts` returns 0, and `tsc --noEmit` is clean; no component broke.
content/site.ts:171:    apply: {
```
