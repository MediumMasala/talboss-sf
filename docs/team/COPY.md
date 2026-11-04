# Tal Select US: copy (round 3)

Owner: copywriter. The source of truth is `content/site.ts` (`site.select`, `site.claims`). This file explains it.

## What changed in round 3 (Steve round 2)

- **Fix 1: honest limits.** There are two new states, and neither says "couldn't find you". In both, the primary action is paste-link and the secondary is skip.
  - `apply.rateLimited`: "Tal is getting a lot of requests from your network." / "Lookups from your network are paused for now. Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume." Shown on API `code:"rate_limited"`.
  - `apply.dailyCap`: "Tal's LinkedIn search is full for today." / "Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume." Shown when the global daily cap is reached.
  - `apply.notFound` is now only for a true not-found.
- **Fix 4: true email card.**
  - `email.needsMoreThin` "Tal only has your title so far. One line from you changes that." is for no LinkedIn confirmed.
  - `email.needsMoreLinkedIn` "Tal only has your LinkedIn so far. One line from you changes that." is for a confirmed LinkedIn without a resume.
  - `email.needsMore` stays as a deprecated alias of the thin line; frontend switches to the two keys.
  - `email.from` is now "Tal · Tal Select".
- **Fix 7: no sentence twice.**
  - Meet Tal now opens "An AI agent with a human team behind him. …"; "talent agent for top professionals" is only in the hero (and SEO).
  - FAQ "Who is Tal?" no longer repeats the about line.
  - FAQ "How does Tal find roles?" drops "round the clock", which is now in how step 3 only, and the first-members line, which is now in `about.more` and done only.
  - FAQ "I'm not looking" no longer echoes the deal.
  - "Nobody sees your name until you say yes" stays in the hero only. Elsewhere it's "Your name stays private until you say yes" (how 4), "Your name goes to a company only after you say yes to that specific role" (FAQ 6) and "Your name goes out only with your yes" (final sub).

## What changed in round 2b

- **Founder decision (4 Nov), overriding Steve fix #6:** there are no named humans. **Tal**, an AI talent agent with a human team behind him, is the protagonist. He is written in the third person ("Tal reads your profile tonight"). "Tal Select" stays as the programme name (eyebrow, done title, nav CTA).
- `site.select.team` is **deprecated**: an empty array kept only so `Sections.tsx` compiles, and `about.teamLabel` is `""`. **Frontend: delete the team block in Sections.tsx; then I'll remove both keys.**
- The round 2 fixes still hold. Buttons promise the payoff ("Draft my intro", "Represent me", "Join Tal Select"), and "application" is on no button. There is one wait string. The SF positioning is honest ("opening in SF now", first members get the first US intros). Each claim number appears once in the body, now in `about.more`.
- Funding (founder decision): `site.funding` reads "We have raised $7 million from Peak XV (formerly Sequoia Capital)." No other investor claims.

## Headline

**Keep building. Tal makes the intros.** (picked)
Others considered: "Keep building. Tal will find the roles." / "Tal is your talent agent. Keep building." / "Keep building. Tal is on it." (cute, cut) / "Meet Tal, your talent agent." (a label, no promise).
Why: it keeps the round-1 line Steve protected and puts Tal in the subject slot. "Makes the intros" is the one job only an agent does. "Find the roles" undersells it, because job boards find roles.

## Page copy, in reading order

**SEO:** Tal Select: an AI talent agent for engineers, now opening in SF / Tal is a talent agent for top professionals, opening in SF now. Tal finds roles that fit and emails them to you. Nobody sees your name until you say yes. Free.
**OG card:** Keep building. Tal makes the intros. / Tal Select is opening in SF. Free for engineers.
**Nav:** Join Tal Select

### Hero
Tal Select · now opening in SF
*Keep building.*
**Tal makes the intros.**
Tal is a talent agent for top professionals, opening in SF now. For six months, Tal finds roles that fit you and emails them to you. Nobody sees your name until you say yes. Free.
*(under form, hidden after done)* You'll read the intro Tal would send a founder about you before he asks for your resume.

### Apply flow
**1. You:** Who should Tal represent? / Name, company and title. Tal finds your LinkedIn and drafts your intro from it. / Full name [Your full name] · Company [Where you work now] · Title [Member of Technical Staff] / **[Draft my intro]** · Paste my LinkedIn link instead → Your LinkedIn link [linkedin.com/in/your-name] **[Draft my intro]**
Errors: "Tal needs your full name and company to find you." / "That isn't a LinkedIn profile link. It should look like linkedin.com/in/your-name."

**2. Search:** Searching LinkedIn → Reading the profile Tal found → Lining it up for you to check · Usually about 15 seconds. · Skip this. I'll add my resume.

**3. Confirm:** Is this you? · Tal only reads your public profile. · [Yes, that's me] [Not me] → Trying the next match
**3c. Rate limited:** Tal is getting a lot of requests from your network. / Lookups from your network are paused for now. Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume. / **[Paste my LinkedIn link]** · Skip. I'll add my resume.
**3d. Daily cap:** Tal's LinkedIn search is full for today. / Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume. / **[Paste my LinkedIn link]** · Skip. I'll add my resume.
**3b. Not found (true not-found only):** Tal couldn't find you. / Some profiles don't show up in search. Paste your link, or skip it and Tal will work from your resume. / [Paste my LinkedIn link] · Skip. I'll add my resume.

**4. The email card (right after "Yes, that's me")**
```
The intro Tal will send                                     Draft
From     Tal · Tal Select
To       a founder hiring for {kind}     (fallback: a role like yours)
Subject  Intro: {First}, {Title} at {Company}
-----------------------------------------------------------------
{pitch streams in}           (while empty: "Tal is drafting your intro")
-----------------------------------------------------------------
Tal drafted this from your LinkedIn. His team sharpens it, and it
goes out only after you say yes to a role.

[needsMore, no LinkedIn] Tal only has your title so far. One line from you changes that.
[needsMore, LinkedIn confirmed] Tal only has your LinkedIn so far. One line from you changes that.
What's the hardest thing you've shipped?
[ One sentence is plenty.              ] [Rewrite it]   Looks good as is
→ "Tal is rewriting it with your answer" → "Rewritten with your answer."
   error: "Tal couldn't rewrite it just now. Try once more?"
```
Alternates: "What are you proudest of from the last two years?" / "What problem would you happily spend the next three years on?" / "What do teammates come to you for?"

**5. Resume (the reward):** Want it sharper? Give Tal your resume. / PDF or DOCX, up to 5MB. More for Tal to work from means a better intro. / US work authorization (Optional): 5 options / **[Represent me]**
*(small link)* No resume handy? Tal will work from your LinkedIn. *(LinkedIn skipped)* No resume handy? Your email is enough for now.
**5b. No resume:** Where should Tal reach you? / Tal emails you when a role fits. You reply yes or no. / Email [you@example.com] **[Represent me]** · Add a resume instead
Errors: "Add an email so Tal can reach you." / "That email doesn't look right. Check for a typo?"

**6. Sending:** Saving your details → Setting up your Tal Select profile → Starting your six months

**7. Done:** You're in Tal Select. / Welcome, {first}. Tal takes it from here. / You're early. Tal's first US intros go to the first members.
- Tonight: Tal reads your profile and sharpens your intro.
- As roles come in: Tal emails you the ones that fit. Each email is one role, and you reply yes or no.
- When you say yes: Nobody sees your name before then. Tal sends your intro to the founder or hiring manager and sets up the conversation.
- For 6 months: Tal keeps looking while you keep building.

Tal represents you until {date}. · Tal will write to you at {email}. · Free for you. Companies pay when they hire.

### How Tal works
1. Tell Tal who you are: Name, company and title. Tal finds your LinkedIn and drafts your intro on the spot.
2. Sharpen it in one line: Answer one question and Tal rewrites the draft with your detail in it.
3. Tal finds the roles: Tal and his team work round the clock to find roles that fit, then email them to you.
4. You say yes, then meet the boss: Your name stays private until you say yes. Then Tal sets up the conversation with the founder or hiring manager.

### The deal
Free for you · Your yes, every time · Six months, then you decide · Your data has one job (now in Tal's voice).

### Meet Tal
**An AI agent with a human team behind him. He reads every profile, finds the roles that fit, and emails them to you.**
*(smaller, `about.more`)* Tal comes from a hiring network built in Bengaluru, with 300,000+ tech professionals and 5,000+ AI and consumer startups. Tal Select is opening in SF now, and the first members get Tal's first US intros.

### FAQ (8)
1. **Who is Tal?** The agent behind Tal Select. Tal drafts your intro, his team sharpens it, and together they pitch you to the founders and hiring managers who make the call.
2. **How does Tal find roles?** Tal and his team search for roles that match your experience, your level and your work authorization, and bring you only the ones that fit.
3. **How will I hear from Tal?** By email. When a role fits, Tal writes to you about it, and you reply yes or no.
4. **I'm not looking. Should I join?** That's the best time. You keep your job, and you decide on each role Tal brings you.
5. **What does it cost?** Nothing. Companies pay when they hire someone Tal introduced. Representation lasts six months, then Tal asks if you want more.
6. **Will my company find out?** Your name goes to a company only after you say yes to that specific role. Tal asks every time.
7. **What about work authorization?** Tell Tal your status when you join. Tal only puts you forward for roles where it works.
8. **Who runs Tal, and what happens to my data?** Tal is built by Grapevine (Watercooler Chat Private Limited) in Bengaluru. Your LinkedIn and resume are used to represent you, nothing else. Email support@gvine.app and we delete them.

### Final CTA (hidden after done)
**Your name, in front of the right founder.** / Free. Six months. Your name goes out only with your yes. / **[Join Tal Select]**

## Key map (`site.select` unless noted)

| Key | Type | Where |
|---|---|---|
| `site.claims.network`, `site.claims.startups` | string | used once in the body, in `about.more` (plus the hero field legend) |
| `site.funding.{before,amount,after}` | string | "We have raised $7 million from Peak XV (formerly Sequoia Capital)." |
| `seo.title`, `seo.description` | string | `app/page.tsx` |
| `og.line`, `og.sub`, `og.alt` | string | `app/opengraph-image.tsx` |
| `hero.eyebrow`, `hero.title` [2], `hero.sub`, `hero.note` | string | hero; hide `note` after done |
| `apply.you.*` | string | step 1; `cta` and `manualCta` = "Draft my intro" |
| `apply.search.{lines[3],wait,skip}` | string | search; `wait` is the only wait string (drop `WAIT_COPY`) |
| `apply.confirm.*`, `apply.notFound.*` | string | confirm / true not-found only |
| `apply.rateLimited.{title,body,manual,skip}` | string | **new**: API `code:"rate_limited"`; `manual` is the primary button |
| `apply.dailyCap.{title,body,manual,skip}` | string | **new**: global daily cap; `manual` is the primary button |
| `apply.email.{label,fromLabel,from,toLabel,to(kind),toFallback,subjectLabel,subject(first,role,company),drafting,draftTag,note}` | string / fn | email card |
| `apply.email.{questions[4],placeholder,submit,rewriting,rewritten,keep,error}` | string | sharpening question; show `questions[0]` |
| `apply.email.needsMoreThin`, `apply.email.needsMoreLinkedIn` | string | **new**: thin = no LinkedIn confirmed; LinkedIn = confirmed, no resume. `needsMore` is a deprecated alias |
| `apply.resume.{title,hint,authLabel,authOptional,auth,cta,sending}` | string | resume as reward; `cta` = "Represent me" |
| `apply.noResume.*` | string | no-resume path |
| `apply.done.{title,lead(first),early,steps[4],until(date),email(email),noEmail,free}` | string / fn | done |
| `apply.done.pitch.{label,tag,loading,note,fallbackNote}` | string | intro card if repeated on done |
| `how.{heading,steps[4]}`, `deal.{heading,items[4]}` | string | proof 1, 2 |
| `about.heading`, `about.body`, `about.more` (**new**) | string | "Meet Tal"; `more` is a smaller second paragraph and **must be wired** (it holds the claims) |
| `faq.{heading,items[8]}` | [q, a][] | FAQ |
| `final.{heading,sub,cta}` | string | final CTA and nav button |
| `team`, `about.teamLabel`, `stats` | deprecated | empty, kept so the build compiles; remove their render blocks |
| `proofLine` | string | logo strip (currently dropped) |

Non-`select` keys are untouched apart from `funding.after`.
