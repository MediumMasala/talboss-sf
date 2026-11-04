PASS. The founder can see it. The city is San Francisco now, and the four things that lost the "wow" in round 1 are fixed. Two small things I fixed myself, and one backend fix is still in flight (below).

# Steve · v4.1 · Round 2 (5 Nov 2026)

I used the site at http://localhost:3217 at 1440, and at 390 inside a 390-wide iframe. I ran one live lookup (Sanchit Tripathi / Grapevine / Strategy Lead). It found the right profile in 1.8 s (probably a cache hit), I said Yes and stopped at A6. Everything else I did in preview: `?state=link` with a bad URL and then Skip, A6 → Continue → Done at both widths, timed frame by frame. No console errors.

## Round-1 list

| # | Item | Status |
|---|---|---|
| 1 | Hero is San Francisco | **Fixed.** The Transamerica Pyramid, Salesforce Tower (with the right rounded crown), Sutro Tower on the hill, and the Bay Bridge's west span with its X-braced towers and the anchorage. Zoomed in, nothing looks invented. |
| 2 | Done feels like a world ahead, not a receipt | **Fixed.** The sun blooms, light spreads along the horizon, and the chips rise and turn into role lines. I fixed two small things (below). |
| 3 | Marquee shows full wordmarks for all twelve | **Fixed.** |
| 4 | Search wait says what's happening | **Fixed.** Live, it narrated "Searching LinkedIn… → Reading the profile… → Checking it's you…". The 390 shot shows "Looking through people named Aryan…". |
| 5 | Bad link + Skip counted as "typed" | **Fixed.** `twitter.com/sanchit` + Skip now gives "No resume handy? Your email is enough to start." |
| 6 | No email on Done was a dead end | **Fixed.** It routes to A6b with "Your resume is saved, but there's no email on it…" and no "Add a resume instead". The duplicate row is still being fixed by the backend lane. |
| 7 | "Is this you?" showed strangers | **Fixed in code** (`lib/linkedin-match.ts`: full name AND company-or-title). Not tested live against a stranger, because I was allowed one paid lookup. |
| 8 | "Tap to choose" on phones | **Fixed** (`flow-A6-390-touch.png`). |
| 9 | A4 trail opened a line with "·" | **Fixed.** |
| 10 | `lib/limits.ts` said "from your network" | **Fixed.** |
| 11 | A5 on short phones | **Fixed** (`flow-A5-390x720.png`: the card clears the pinned Yes/No). |
| 12 | Chat and mock tell the same story | **Not done.** It's a design question for the next round, and it doesn't block. |
| 13 | Reduced motion | **Fixed.** Frontend verified it with CDP emulation; it matches the reduced shots. |
| 14 | FRONTEND.md deviations | **Done.** |
| F10 | A7 sub width | **Fixed.** It uses the frame's 560 column. |

## The two open calls

**(a) The sample role lines on Done.** As shown, they weren't honest. They sat right under "Tal is already looking for your first roles", with nothing to say they were samples. Anyone would read them as three roles Tal had already found for them, a minute after signing up, and on Monday they'd feel lied to. **Keep them, and label them.** I added "Examples of what Tal sends." (13 px, s600) under the lines. It fades up with the first role line, so the place chips are never mislabelled. It's laid out from the start, so nothing shifts.

**(b) Salesforce without its cloud.** **Acceptable.** At 20 px and 40 % white, the lowercase wordmark reads as Salesforce. The cloud would read as a grey blob with unreadable text inside. It's the same choice as LinkedIn's "in" box and Spotify's circle: show the part you can recognize. If Salesforce's brand team ever objects, swap it then.

## What I fixed now (`tsc --noEmit` green, nothing committed)

- `components/flow/Done.tsx`
  - **The chips rose through the page.** With `RISE = 120`, the third chip ("Remote") rose through "Tal will write to …" and the Done pill, which are already on screen by then (frame at about 3.3 s). It looked like a collision, not a sunrise. Now `RISE = 36`: a short lift that never crosses them.
  - **The cross-fade ghosted.** The role line came in 150 ms into the chip's 450 ms fade, so "ML engineer" and "Bay Area" showed on top of each other. Now the role line starts 300 ms in, and the swap reads as one thing turning into another.
  - Added the samples line (a).
- `content/site.ts`: `done.rolesNote: "Examples of what Tal sends."`
- `components/landing/Marquee.tsx`: Sarvam's height went from 16 to 14. It was the loudest mark in the row, louder than Google.
- `docs/team/FRONTEND.md`: the Done animation notes now say 36 px and +300 ms, and describe the samples line.

I checked all of it live at 1440 and 390.

## Wow moments

- **The first frame.** The silver tal wordmark sits between the Pyramid and Salesforce Tower, with a bridge running out of frame. Anyone who lives here knows the city in a second. This is the picture that sells "Now in San Francisco".
- **The click that blooms into the flow.** Unchanged, and still the best transition on the site.
- **The answer flying into the trail**, then into the card on A5. With a real profile (my photo, three real roles), "Is this you?" looks like the product already knows you. Neither Dex nor Jack & Jill has that moment.
- **Done.** Your name builds out of blur over a sea of clouds at dawn. The chips rise and become roles, and the horizon keeps breathing. It reads "something has started", not "form received".
- **The marquee.** Twelve real wordmarks in one quiet row now read as proof.

## Lost moments (none block)

- **The sun bloom is barely visible.** A white glow on a white page has almost no contrast. Mostly you see the horizon line brighten. It's pleasant, but if the founder wants more "light", design would need a slightly warmer, darker still behind the sun. Frontend can't create contrast that isn't in the image.
- **Narration on a fast search.** On a cache hit, all three stages flash by in under a second, so the line flickers. A minimum of about 700 ms per stage would make it read. That's a frontend nicety, and it only shows on a fast search.
- **Chat and mock still say the same thing** (item 12). For the next round, the mock should show what the chat can't, such as the founder's reply arriving.

## Before the founder sees it

1. **Backend:** the duplicate row on the no-email path (in flight; "attach email to submission").

That's the only one. The rest is polish for the next round.
