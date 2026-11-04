# BRIEF V3: start again, with soul (supersedes BRIEF.md where they differ)

## The founder's verdict on v2 (4 Nov 2026, in his words, compressed)
"It feels very much like something Claude has made. Steve Jobs would never approve it from his grave. I was not looking for an AI website. I was looking for something A24 would make: the A24 of websites. Something that feels human, made with soul. Think of Minari. Think of CODA. Think of Amélie. They use filters, greens, real humans, characters, feeling, music, sound, all of which remind you that you're human. Someone who uses this website should be reminded that they're talent, that they're a human, and that this is a human talent agent who works for them. It needs to be classic and classy."

His specific complaints:
- **Horrible copy:** "Keep building. Tal makes the intros." "Your yes, every time." "Six months, then you decide." "Your data has one job." "Your name goes out only with your yes." "An AI agent with a human team behind him." He calls all of it AI language: "I cannot be proud of this."
- **Visuals:** just text on a plain background; grey and black on beige; badly shaped grids (four equal text columns, a boxed 2×2 'deal'); a dot field nobody understands ("what in the name of God is this?").
- **Tal must not be "he".** Tal is a talent agent, the product, an "it" or simply "Tal".
- **"Tal is the talent agent behind Tal Select?"** That doesn't sell to an SF engineer. Make the naming simple.
- **The flow is good;** keep its logic: name/company/title → LinkedIn found → "Is this you?" → intro → resume optional → done. **Remove the work authorization question.**
- **No real assets were used.** Our India site https://tal-boss-web.vercel.app/ feels real and human; use its assets, vibe and people as the base.
- **Competitors** https://www.jackandjill.ai/ and https://meetdex.ai/ "look 10× better than this". We must beat them, not trail them.
- **Interactions:** "On every website, understand how the interactions happen. Someone needs to actually hover the mouse on those websites and feel how they interact, how they feel human, how they talk to you, how they live and breathe." CSS-reading is not enough.

## Who we are (tell this story; this is the soul)
- Tal is built by Grapevine, a Bengaluru team of about 20. Grapevine built India's largest anonymous professional network (1M+ verified professionals sharing real salaries and real company truths). Then came Round1, an AI-interview hiring agency that became profitable placing engineers at India's fastest-growing AI companies (Sarvam's head of engineering became its CTO). Then came Tal: a talent agent for professionals.
- The founder (Strategy Lead, founding member) believes we're "not in the hiring business; we're in the business of making two people meet about an opportunity." Modern hiring hires the mask: resume, keywords, LinkedIn. Tal hires the person. The unit is a conversation between talent and the person who makes the call, not an interview gauntlet.
- What Round1 learned: the scarce thing is trust. A founder said, "just give me a profile; if it's from you I'll talk." That's what a talent agent earns.
- **What Tal is for talent:** Tal is the talent agent for every top professional. Tal and its team read every profile and work round the clock to find the roles that fit, and email them to the talent. The talent decides. It's free for the talent; companies pay when they hire.
- **The US step:** opening now in SF, for the best engineers, AI/ML people, PMs and designers. The network behind it: 300,000+ tech professionals; the founder also states 5,000+ AI and consumer startups (unverified, keep it in one constant). Funding line: "We have raised $7 million from Peak XV (formerly Sequoia Capital)." Representation lasts 6 months.
- It's 2026. The audience includes the AI engineer at Anthropic or OpenAI in SF. They've seen every AI landing page; they're tired of them. What moves them now is craft, people, warmth and taste, like a beautiful film, a great bookshop or a hand-set letter. The test still stands: they look at it and say "wow, I should try this."

## Hard rules
- **Honesty.** No fake testimonials, no invented members, no fake press. Photographs of people are atmosphere, never presented as Tal members or quotes. Every asset must be Tal-owned (from the India site or repo) or properly licensed: the Unsplash or Pexels licenses, CC0, or original work you create. Record every asset and its licence in `docs/team/ASSETS.md`. Never use film stills, A24 posters or anything copyrighted from those films; take the feeling, not the material.
- **Copy.** Plain, warm, human, serious about careers. Banned AI tells: tidy parallel taglines, "your X, every time", "X has one job", fake intimacy, clipped three-beat slogans, em-dash theatre, "not X, but Y". Write like a great agent talks to someone they believe in.
- **Sound** is allowed and encouraged if tasteful: off by default, one clear toggle, original or CC0, tiny file.
- **Performance and accessibility still matter:** fast first paint, reduced motion respected, works at 390px.
- **The flow's backend contract stays** (`docs/team/API.md`). Work authorization goes.

## Interaction study (mandatory for Steve and the frontend engineer)
Actually use the sites: scroll, hover, click, resize. Use the Chrome browser tools if they're available in your session (load them with ToolSearch: claude-in-chrome; open your own tab; never close others; never log in or fill forms on those sites). Otherwise drive the local Chrome with a CDP/puppeteer-core script: hover over elements, scroll, and capture frames before and after. The previous engineer left `/tmp/ts-shots/cdp.mjs`.

Study, at minimum: tal-boss-web.vercel.app (ours), jackandjill.ai, meetdex.ai, why.zero.university, a24films.com. Write what you *felt* and how each interaction works (timing, easing, cursor, sound, copy tone) in your notes.

## Files
- Repo `~/Desktop/Tal by Grapevine/talboss-sf`, branch `tal-select-us`. Dev server: http://localhost:3217 (`npx next dev -p 3217`).
- Earlier docs: `docs/team/BRIEF.md`, `API.md`, `COPY.md`, `FRONTEND.md`, `STEVE_ROUND_1..3.md`. The v2 design and copy are rejected; the backend and API are kept.
- The Steve persona, written by the founder: `~/Desktop/Jobs/jobs/data/Jobs Prompt.txt`, `Jobs Inner Prompt.txt` and `Jobs_Principles.txt`. Steve must read all three in full before doing anything.

## Founder answers (4 Nov, evening)
1. Sarvam may be named: an engineer Round1 placed at Sarvam AI went on to become its CTO. One mention.
2. "5,000+ AI and consumer startups" approved; one mention.
3. Roles are in San Francisco, the Bay Area, and remote.
4. After six months with no reply, we assume they're not actively looking and stop.
5. A quiet logo row is allowed (overrides DIRECTION §5 "no logo strips"), captioned "Bosses from these companies hire on Tal". Verified against the database on 4 Nov: Google, Microsoft, Amazon, Uber, Salesforce, Adobe, LinkedIn, PayPal, Intuit, Spotify, Razorpay, Sarvam all have bosses with Tal accounts.
