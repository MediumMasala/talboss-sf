PASS. Every item in FEEDBACK_V4_2 is on the page. I found one honesty problem on the numbers wall: the headline read as "300,000 people in the Bay Area". I fixed it, and I made the wall read as power rather than a table. Three questions only the founder can answer are listed at the end.

# Steve · v4.2 · Round 3 (5 Nov 2026)

I used the site at http://localhost:3217 side by side in a 390-wide iframe and a 1440-wide iframe. I checked `/start?state=A1`, `noemail`, and `A6` → Continue (the Done animation at both widths), and ran one live lookup (Sanchit Tripathi / Grapevine / Strategy Lead): **1.84 s from Enter on the title to "Is this you?"**, with the photo and three real roles. I stopped at A5, so nothing was uploaded. No console errors.

## FEEDBACK_V4_2, item by item

| # | Item | Status |
|---|---|---|
| 1 | "In early preview within the SF Bay Area" in the hero; no "just opened" | **Fixed.** On desktop it's on its own line. The numbers wall says early preview too (now in its body line, see below). |
| 2 | "Apply for Tal" everywhere; no Questions? button | **Fixed.** Nav, hero and bottom CTA all read "Apply for Tal". The landing nav and the flow header have no Questions? pill (checked live on A1 and A6b at both widths; the `flow-noemail-*` shots are stale and still show it). |
| 3 | Step 02 "Tal builds your career graph", step 04 "We only apply once you approve" | **Fixed.** I changed step 04's sub (below). |
| 4 | "What to expect", no orb, four human lines | **Fixed.** It reads like a friend over coffee. The four lines follow the founder's direction almost word for word. |
| 5 | Four warm questions, nothing that plants a fear | **Fixed.** I cut one "simply". |
| 6 | Done sub, exact words | **Fixed.** "Tal will mail you when a good role that matches you is found." The example chips sit under it, labelled. |
| 7 | Numbers wall: real counts, dense, 300,000+ total, no mock, no white space | **Fixed, then fixed again by me.** Real counts from `network.json`, and the mock is gone. Two problems were left, and I fixed both (below). |
| 8 | Language: human, friendly, specific, no AI tells | **Passes.** Tal is "Tal" or "it" everywhere. I found no "active", "weekly", "just opened" or "he". |
| 9 | Hero: the Bay from above, silver, company landmarks, original | **Fixed.** It's an original model, not HBO's. See the hero section. |
| 10 | LinkedIn lookup faster | **Fixed.** 1.84 s live from the title to the card (the prefetch at A2 did the work; it may also have been a cache hit). Round 1 took ~16 s. |

## Honesty

- **Every number on the wall is in NETWORK_NUMBERS.md and none is on the do-not-publish list.** The wall shows 200,000+, 37,000+ (labelled "Engineering leads", not "leaders"), 33,000+ (the label keeps "analysts"), 29,000+, 13,000+, 11,000+, 8,300+, 7,000+ and 5,900+. The four stack buckets, QA, US/Bay sizes and the Spotify/Sarvam counts are all left out.
- **Landmarks:** nine marks, all from the 12 verified companies (Salesforce, Uber and Microsoft in SF; Google and Intuit in Mountain View; LinkedIn and Amazon in Sunnyvale; Adobe and PayPal in San Jose). Nothing else.
- **What I caught:** the wall's headline was "300,000+ tech professionals. In early preview in the Bay Area." Put the two sentences together and anyone reads it as 300,000 people in the Bay. The real Bay figure is 522. That's exactly what do-not-publish #4 forbids, just implied instead of stated. Fixed (below).
- **Smaller, for the data lane:** the label "Security engineers" counts SOC analysts and "cyber" titles too, the same issue as "Data … and analysts". "Security" alone would be exact. I didn't touch `network.json`.
- `startups 5,000+` is the founder's own figure and wasn't re-checked (NETWORK_NUMBERS says so). It's fine as long as he stands behind it.

## What I fixed (`tsc --noEmit` green, nothing committed)

- **`content/site.ts`**
  - Numbers wall: `stats.total` = `claims.network` (new). `headline` is now "tech professionals in Tal's network." `body` is "Here's who they are, by what they do. Tal is in early preview within the SF Bay Area." The early-preview line stays on the wall, as item 1 asks, but no longer sits right next to 300,000+.
  - Step 04 sub: "Say yes to a role and Tal makes the intro." The old line ("You see every role first. Nothing goes out without your yes.") was the third time the page said that, after the chat caption and What to expect. The new one is warm and says what happens next.
  - FAQ: "it simply stops" → "it stops".
- **`components/landing/BehindTal.tsx`**
  - **The total is the headline.** 300,000+ now stands alone at 112 px (64 on phones) and counts up, with the sentence finishing under it at 40. Before, the total sat at the same size as the body copy and every tile in the grid was the same size, so it read like a spreadsheet. Now there's one big number and the grid underneath shows who those people are.
  - **Five columns from 1360 px** (`.wall-grid`). Ten tiles make two full rows at 1440. Before, it was 4 + 4 + 2, which left half of the last row as empty white, the exact white space the founder asked to kill. 1024–1359 stays at 4 columns, because "200,000+" doesn't fit a fifth.
- **`components/landing/Landmarks.tsx`**
  - The marks use the marquee's optical heights, so INTUIT's full-height caps no longer shout over a small Google. The gap between marks went from 6 to 8 px, so LinkedIn and Amazon stop touching.
  - The San Jose row (Adobe, PayPal) went from 50 to 58 % opacity, with its dimmest pulse at 40 % instead of 30. It sits in the wordmark's glow, and PayPal was half lost in it.
- **`components/landing/Hero.tsx`**: a phone-only scrim, a wide flat pool of dark behind the sub line. At 390 the desktop ellipse is only ~117 px wide, so "The talent agent for engineers…" sat right on the lit city. Now it reads, and the map still shows around it.
- `docs/team/COPY.md`, `docs/team/FRONTEND.md`: updated to match.

## The hero (1440 and 390)

It's the Bay. At 1440, a Bay Area local sees the peninsula running away from them, the bridges, and the far end where San Jose sits under the wordmark. The silver tal rises from the horizon like a sun coming up over the valley. That's the founder's "companies rise as landmarks", made our own, with nothing taken from HBO. Is it subtle? It's subtler than the skyline was. It's a full-bleed image, but it's dark, grey and grainy, and it sits behind the type, not in front of it. I'd keep it.

Do the landmarks read? The SF column (salesforce, Uber, Microsoft) reads at a glance. Google and Intuit read now that their sizes are balanced. LinkedIn and Amazon are legible but small, and they sit on a lit tower. Adobe and PayPal sit in the glow and you have to look for them. That's fine for the far end of the valley.

On the phone, LinkedIn and Amazon hang out over the water toward the East Bay. A local would place them in Fremont, not Sunnyvale. See "Must still change" #3.

## The numbers wall: power or spreadsheet?

Before my change, it was a spreadsheet: nine equal numbers, a small headline, and a half-empty last row. Now the first thing you see is **300,000+**, set big, and then the people under it, two full rows of what they do. It's closer to "the people are the power". It still doesn't name *people*. See "Must still change" #2.

## Wow moments

- **The first frame.** The silver wordmark comes up over a silver Bay, and the companies light one by one down the peninsula. No other site in this space has that.
- **"Is this you?" in under two seconds**, with your own photo and three real roles. It looks like the product already knows you. That's the moment that's 10x more legit than Dex or Jack & Jill.
- **Done.** Your name builds over the clouds, and the chips turn into role lines. It still feels like something has started.
- **300,000+**, set big, counting up, now that it has the room.

## Lost moments

- **The wall still shows counts, not people.** "Silicon Valley bleeding through the platform" wants faces or company names, not one more number.
- **An AI engineer at Anthropic or OpenAI** sees a beautiful site, a real network and a fast lookup. But the only roles on the page are "a Series B payments company" and "a seed-stage dev tools company". If one real, named Bay Area role or founder is on the page, they think "I should try this". Without one, they think "nice".
- The chat and the mock still say the same thing (round-2 item 12). The mock is gone now, so this is moot.

## Must still change (owner)

1. **Founder: what do the landmarks and the marquee claim?** "Bosses from these companies hire on Tal" is true of India. Put next to Google's and LinkedIn's Bay campuses lighting up in the hero, an SF engineer will read it as "these companies hire through Tal here". It's his direction and it isn't on the do-not-publish list, but it's the one place an SF reader could feel misled later. Either he stands behind it, or the caption becomes something like "People from these companies are in Tal's network" (true, from the 53,744 count).
2. **Founder + copy: one real, named Bay Area role or company in the chat card**, as soon as there's one Tal can stand behind. That's what moves the AI-engineer test from "nice" to "I should try this".
3. **Frontend/art: the Sunnyvale marks on phones** (4:5 crop) hang over the water toward the East Bay. Fix it with a column to the right of the light, nudging Google/Intuit down. Or drop Sunnyvale on phones as San Jose already is. Polish, not a blocker.
4. **Data lane:** "Security engineers" → "Security" (the bucket includes SOC analysts).
5. **Frontend:** re-run `scripts/shots.sh`. `flow-noemail-*` and the landing shots predate v4.2 and my changes.
