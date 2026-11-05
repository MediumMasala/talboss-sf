# Tal US site: copy (v4.2, 5 Nov 2026)

Owner: copywriter. Source of truth: `content/site.ts`; components only read from it. v4.2 follows the founder's review `FEEDBACK_V4_2.md` (binding) on top of `FEEDBACK_V4.md`.

**Voice:** a good friend explaining it over coffee. Human, friendly, specific. Short sentences, no hype, nothing that plants a fear. Tal is "Tal" or "it", never "he"; the page speaks as "we". The old programme name never appears on screen.

## Key map

| Screen | Keys in `site` |
|---|---|
| Meta | `seo`, `select.seo`, `select.og` (the OG alt text file is written by `scripts/og.mjs`) |
| Raised bar | `funding.line` |
| Top nav / flow header | `select.topBar.wordmarkLabel`, `.cta` (no Questions button since v4.2) |
| L1 Hero | `select.hero.sub`, `.cta`, `.note` |
| Logo marquee | `select.proofLine` |
| L2 Chat card | `select.chat.tal`, `.role`, `.caption`, `.messages[]`, `.typing` |
| L3 Numbers wall | `select.stats.eyebrow`, `.headline` (uses `claims.network`), `.body`, `.startups` (uses `claims.startups`), `.gridLabel`; the function tiles come from `content/network.json` (see below) |
| L4 How it works | `select.how.heading`, `.sub`, `.steps[]` |
| L5 What to expect | `select.deal.heading`, `.rows[]` (lead in white, rest in 64 % white) |
| L6 Questions | `select.faq.heading`, `.items[]` |
| L7 Bottom CTA + footer | `select.credits.cta`, `.questions` (the only "Questions" link outside its section), `.copyright`, `.privacy`, `.terms`; `select.hero.note` under the CTA; `legal.supportEmail` |
| Flow | `select.steps.*`, `select.apply.*`, `upload.*` (unchanged except A4 sub and A7 sub) |
| Claims | `claims.network` (headline of L3), `claims.startups` (last tile of L3). Each used once. |

**Numbers wall data.** The per-function figures are never typed into `site.ts`. `content/network.ts` reads `content/network.json` (data lane, SQL in `docs/team/NETWORK_NUMBERS.md`): `functions[]` with `label` and `display`. Only a clean rounded figure renders (`48,000+`, `12K+`, `1.2K+`); anything else shows "—". Until the file exists, `content/network.placeholder.json` supplies the labels with "—" for every value.

## The copy, in screen order

### Meta
- Title: Tal: a talent agent for engineers, researchers, PMs and designers
- Description: Tal is a talent agent for engineers, researchers, PMs and designers, in early preview within the SF Bay Area. You see every role first, and it's free for you.
- OG line: The talent agent for engineers, researchers, PMs and designers. In early preview within the SF Bay Area.

### Raised bar and nav
We've raised $7 million from Peak XV (formerly Sequoia Capital). · tal · [Apply for Tal]

### L1 Hero
- **tal** (the metallic wordmark)
- The talent agent for engineers, researchers, PMs and designers. / In early preview within the SF Bay Area. *(exact; each sentence on its own line on desktop)*
- [Apply for Tal]
- Free for you. Companies pay when they hire.

### Logo marquee
Bosses from these companies hire on Tal

### L2 Chat card
- Tal · Monday: Three new roles for you: SF, the Bay Area and remote. (Staff engineer, a Series B payments company · Founding engineer, a seed-stage dev tools company · ML engineer, a Series A health company)
- You: Yes to the payments one. No to the other two.
- Tal · Tuesday: Intro sent to the founder. They'll write to you directly.
- Caption: An example of a week with Tal. Nothing goes to a company until you say yes.

### L3 The numbers wall
- THE PEOPLE BEHIND TAL
- **300,000+ tech professionals. In early preview in the Bay Area.**
- Engineers, PMs, designers, data scientists and founders. Here's who they are, by what they do.
- Tiles: one per function from `network.json` (label + figure), then **5,000+** AI and consumer startups.

### L4 How it works
Three questions now. Tal does the rest.
01. **Tell Tal who you are.** Your name, where you work and your title. It takes a minute.
02. **Tal builds your career graph.** Your roles, skills and history, read from your LinkedIn and resume.
03. **Tal emails you roles that fit.** Roles at AI and consumer startups, picked for what you do.
04. **We only apply once you approve.** You see every role first. Nothing goes out without your yes.

### L5 What to expect
- **It's free for you.** Companies pay Tal when they hire someone.
- **You'll see every role first.** Tal only applies to the ones you approve.
- **Tal works for you for six months.** Go quiet and Tal will stop reaching out.
- **Roles are in San Francisco, the Bay Area, and remote.**

### L6 Questions
1. **Who is Tal for?** Engineers, researchers, PMs and designers who'd like to hear about good roles in San Francisco, the Bay Area or remote. You don't have to be looking right now.
2. **Does it cost anything?** No, it's free for you. Companies pay Tal when they hire someone it introduced.
3. **Which companies does Tal work with?** AI and consumer startups, from seed to late stage. Tal only sends you the roles that fit what you do.
4. **What happens after six months?** Tal checks in to ask if you'd like to keep going. If you don't reply, it simply stops.

### L7 Bottom CTA and footer
[Apply for Tal] · Free for you. Companies pay when they hire. · © 2026 Tal · Questions · Privacy · Terms · support@gvine.app

### Flow
Header: the tal tile (and, on phones, Back once there is somewhere to go back to). Every question screen: [Continue] · "or press Enter to continue"; progress: Name, Company, Title, LinkedIn, Resume. Desktop footer: Back.
- **A1** What's your full name? / This is the name Tal introduces you by. / [Your full name] / Add your full name to continue.
- **A2** Where do you work? / Company name is enough. / [Company] / Add where you work to continue.
- **A3** What's your title? / Member of Technical Staff, Staff Engineer, Product Lead… / [Member of Technical Staff]
- **A4** Finding you on LinkedIn / Tal is reading your photo, roles and history so you don't have to type them. / {Searching LinkedIn… → Looking through people named {first}… → Reading the profile… → Checking it's you…} / This usually takes a few seconds. / Paste my LinkedIn link instead
- **Paste link** What's your LinkedIn link? / [linkedin.com/in/your-name] / That isn't a LinkedIn profile link. It looks like linkedin.com/in/your-name.
- **A5** Is this you? / We only read your public profile. / [No, not me] [Yes, that's me] / Paste my link / Checking the next profile / That's everyone we found. Paste your LinkedIn link instead.
- **A5b** We couldn't find you on LinkedIn · Tal is getting a lot of requests right now · Tal's LinkedIn search is full for today · Tal's LinkedIn search isn't working right now · You're offline (each with "Paste my LinkedIn link" and, where it applies, "Skip, I'll add my resume" or "Try again").
- **A6** Add your resume / Optional. It helps Tal represent you better. / Drop a PDF or DOCX, or click to choose (touch: Tap to choose a PDF or DOCX) / [Continue] / No resume handy? We'll work from your LinkedIn.
- **A6b** Where should Tal write to you? / We'll email you when a role fits. / [Continue] / Add a resume instead
- **A7** {Full name} / REPRESENTED BY TAL · UNTIL {date} / **Tal will mail you when a good role that matches you is found.** *(exact)* / chips San Francisco · Bay Area · Remote, each turning into a sample role line / Examples of what Tal sends. / Tal will write to {email}. / [Done]

## Changed in v4.2
- "Now in San Francisco." → "In early preview within the SF Bay Area." (hero, OG, meta); the numbers wall says "In early preview in the Bay Area" (no "just opened").
- "Ask Tal to represent you" → "Apply for Tal" (nav, hero, a new bottom CTA, the flow's page title).
- Removed: the Questions? button (landing nav and flow header), "Will my employer find out?", "How do I delete my data?", the product mock copy (`select.mock`), the old `stats.items` / `stats.body` ("Tal just opened…").
- "The deal" → "What to expect", four rewritten lines; How 02 and 04 retitled; Done sub replaced; chat caption no longer says "your yes" (it reads as a slogan there), the chat's last line says "They'll write to you directly" (Tal reaches you by email, not in a chat).

## Banned-pattern grep
`grep -nEi "—|–|\b(he|him|his)\b|tal select|work.?auth|interview|candidate|talent pool|unlock|seamless|game.changer|supercharge|that's it|no catch|got you|pitch|letter|employer find|delete my data|now in san francisco|just opened" content/site.ts`
Every hit is a code comment or the placeholder dash rule, not user-facing copy. "apply" and "your yes" are now allowed in the two places the founder's brief puts them (the CTA, How 04).
