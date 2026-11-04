# Team brief: Tal Select US (read this first, every round)

## The only test that matters (Steve's verdict)
> "Would an AI engineer working at Anthropic or OpenAI in SF look at this website and say: wow, I should try this out, this is cool?"

Every decision is judged against that person. They are senior, skeptical and allergic to recruiter spam, stock imagery, hype words and template SaaS pages. They respect taste, speed, honesty, craft, and products that clearly know something. What makes them try it: it feels like it was built by people like them, it costs them nothing, it respects their time, and it shows real intelligence in the first ten seconds.

## What we're building and why
Tal (by Grapevine, Bengaluru) runs **Tal Boss**, a hiring marketplace where candidates chat with the boss directly, and **Tal Select**, its agency arm: a human-plus-AI talent team that represents strong candidates to founders and hiring managers and sets up the conversation.

This site is a **test for US LinkedIn ads** aimed at the highest-quality US tech professionals (engineers, ML/AI, PMs, designers). Joining Tal Select means Tal represents them for **6 months** for top SF and US roles that appear. It's step one of Tal's US ladder: candidate supply and representation first, no consumer launch.

The previous version (black canvas, Michelangelo hands, Golden Gate line drawing, scribble underline, pill chips) was judged **gimmicky, not confidence-inspiring**. Start fresh on taste. Keep the name "Tal Select" and the tal wordmark (`/public/tal-boss-wordmark.svg`, a white stacked "tal / BOSS"; you may design a cleaner "tal" or "Tal Select" lockup in type); everything else can change.

Inspiration (study, don't copy): https://why.zero.university/ (the founder's favourite, "the most tripped out": take its ambition, motion and nerve, not its content), https://wabi.ai/ , https://www.micro1.ai/ , https://www.mercor.com/ . Mercor and micro1 are restrained, editorial and high-trust, with one clear action. Wabi is playful but very polished. Our own India product: https://tal-boss-web.vercel.app/ . The target: as unforgettable as zero.university, as trustworthy as Mercor.

## Claims we may use (this goes into paid ads; exact wording matters)
- **300,000+ tech professionals** in the Tal network. Verified: ~234K Tal app users plus ~1.04M Grapevine network users. Never "meet every week" or "active".
- **5,000+ AI and consumer startups**: stated by the founder, unverified by our database (~1,750 companies with a boss account, ~3,500 that posted a role). Keep it in ONE constant (`site.claims.startups`) so it can be changed later. Use it at most twice.
- "We have raised $7 million from Sequoia." Pre-existing and unverified. Keep it exactly in `site.funding`; add no other investor claims.
- Free for the candidate; companies pay when they hire. We ask before putting anyone forward for a role. Representation lasts 6 months.
- **Forbidden:** fake testimonials, fake press logos, invented numbers, fake people or names, "as seen in". Company logos only from `/public/brands`, with the line "Bosses from these companies hire on Tal" (mostly India-based bosses; never imply US openings at those companies). You may drop the logo strip if it hurts trust.

## Voice
Crisp American English with real power. Short sentences. Specific over clever. No AI slop:
- no "unlock", "seamless", "game-changer", "revolutionize", "supercharge", "Done. That's it.", "No catch.";
- no em-dash theatre and no "not X, but Y" tics.

Use "conversation" or "intro", never "interview", in candidate headlines. Talk to the reader like a peer engineer would.

## The flow (must stay working end to end)
1. Name, company, title, then "Find me on LinkedIn" (Apify; 30–60 s today, make it feel fast).
2. "Is this you?" Yes / No, with "No" trying the next profile. Also "paste my LinkedIn link" and "skip".
3. US work authorization (optional) plus resume upload. **New: skipping the resume must be possible, subtly** ("No resume handy? We'll work from your LinkedIn"), which then asks for an email.
4. Done: what happens next, with the representation end date. **New: an AI-drafted "how we'd introduce you" pitch** (2–3 sentences, Gemini) from their LinkedIn and title, shown as a draft our team will refine. This is the moment that should make the AI engineer smile.

## Repo and running
- Repo: `~/Desktop/Tal by Grapevine/talboss-sf` (branch `tal-select-us`). Next 16 App Router, React 19, Tailwind v4, framer-motion (LazyMotion strict: use `m.` not `motion.`), Cloudflare via OpenNext (D1 `DB`, KV `RESUMES`).
- **Read `node_modules/next/dist/docs/` before using Next APIs.** This version has breaking changes.
- Dev server: `http://localhost:3217` (if down: `npx next dev -p 3217` in the repo). Local secrets are in `.dev.vars` (gitignored): APIFY_TOKEN, LINK_SECRET, SHEET_KEY. The backend adds GEMINI_API_KEY from `../TalBoss/boss-live/.env`. Never print, echo or commit secrets.
- npm: add `--cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache` (the default cache has a permissions problem). Avoid heavy dependencies; fonts via `next/font` are fine.
- `npx tsc --noEmit` must stay clean.
- Don't run real Apify lookups in testing except with the name "Sanchit Tripathi", company "Grapevine" (the founder's own profile). Each run costs money.
- **Preview states for review:** support `/?preview=you|search|confirm|notFound|resume|noResume|sending|done` (dev only, mock data, no network calls) so every step can be screenshotted:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,2600 --virtual-time-budget=6000 --screenshot=OUT.png "http://localhost:3217/?preview=done"`.
  Headless Chrome won't go below ~500px wide, so for mobile wrap the page in a 390px iframe inside a local HTML file.

## File ownership (don't edit files you don't own; tell the orchestrator instead)
- **Copywriter:** `content/site.ts` (`select`, `claims`) and `docs/team/COPY.md`.
- **Backend:** `lib/**`, `app/api/**`, `migrations/**`, `docs/team/API.md`.
- **Frontend:** `components/**`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/opengraph-image.tsx`, `public/**`, `docs/team/FRONTEND.md`.
- **Steve:** reads everything and writes only `docs/team/STEVE_ROUND_<n>.md`.

## Quality bar
- Fast (the old page scored 100 on Lighthouse) and accessible (labels, focus, reduced motion).
- Works at 390px with no layout shift.
- Progress never lies.
- A senior engineer should find nothing to sneer at.

## API contract (backend builds it, frontend codes against it from day one)
- `POST /api/linkedin/start` `{name, company, role, url?}` → `{state:"pending", stage, token}` | `{state:"error", message}`
- `GET /api/linkedin/poll?t=<token>` → `{state:"pending", stage:"search"|"people"|"profile", token}` | `{state:"found", profile, next}` | `{state:"not_found", next:null}` | `{state:"error", message}`. The profile shape is `Profile` in `lib/linkedin.ts`.
- `POST /api/linkedin/profile` `{next}` ("not me") → same as start.
- `POST /api/upload` multipart: `resume` (file, **optional now**), `utm` (JSON), `application` (JSON: `{name, company, designation, linkedinUrl, linkedinStatus:"confirmed"|"typed"|"skipped", linkedinProfile, workAuth, email?}`) → `{ok:true, id, email}` | `{ok:false, error}`. With no resume, `application.email` is required (400 otherwise).
- `POST /api/pitch` `{name, company, role, profile?}` → `{pitch: string, source:"ai"|"fallback"}`. 2–3 sentences in Tal Select's voice, never invents facts, under ~4 s; falls back to a template line on error. The frontend may call it as soon as the profile is confirmed so it's ready on the done screen.

## Founder decision (4 Nov, overrides Steve R1 fix #6): Tal is the agent
- We are a top AI startup. Our product is **Tal**. **Tal is the talent agent for every top professional.**
- **Tal and his team** read every profile and work round the clock to find relevant roles, then **email them to the talent**. The talent says yes before anyone sees their name.
- Do NOT name individual humans or put staff photos on the page. "Tal" is the character: an AI agent with a human team behind him. Write about Tal in the third person ("Tal reads your profile tonight"). The marketplace voice stays clear, not cute.
- Keep "Tal Select" as the programme name where needed, but the hero and done screen should make Tal, the agent, the protagonist.
