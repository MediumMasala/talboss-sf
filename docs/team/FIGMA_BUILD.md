# FIGMA_BUILD · Tal US v4

File: Tal US · v4 `QjHT7mWSNvgeAuiQehZZNJ` — https://www.figma.com/design/QjHT7mWSNvgeAuiQehZZNJ

## Pages
| page | id |
|---|---|
| 00 Contact sheet | 0:1 |
| DS | 1:2 |
| 01 Landing · 1440 | 1:3 |
| 02 Landing · 390 | 1:4 |
| 03 Flow · 1440 | 1:5 |
| 04 Flow · 390 | 1:6 |
| 05 Prototype | 1:7 |

## DS kit (page `DS`)
Imported from the Boss Design System library by key (all four succeeded, nothing rebuilt):
- Button set (1:80) · Input / Hero Field set (1:764) · tal logo v2 set (1:824) · Icon Button set (1:848)
- Icons from the same library family (Anron Icons 10): chevron-left 2:81, arrow-right 2:96, linkedin 2:111, file-upload 2:130, arrow-top-right 2:151

Local styles: paint `surface/000…1100`, `dark/canvas-2`, `dark/glass`, `dark/hairline`, `dark/text-secondary`, `dark/text-sub`, `brand/metallic`; text `Onboarding/*`, `Text/*`, `Landing/*`, `Profile/Name 20`, `Done/Name 56` (all Inter).

Local components built from imports:
- DS/Logo Tile 2:63 (44.64 white tile, radius 12, shadow 0 4 12 @14%, tal logo v2 instance)
- DS/Progress Segment set 2:75 (Progress=0/50/100; 2px #EBEBEB track, #222 fill)
- DS/Header 1440 2:165 · DS/Header 390 2:208 (logo tile + outline pill "Questions?", Button Outline/Medium with label 13/20, p 8)
- DS/Footer 1440 2:183 (5 segments gap 8 + ghost "‹ Back" at x 48) · DS/Footer 390 2:224 (2px progress only, sits under header)

Note: the Hero Field component ships with SF Pro text; every instance is overridden to Inter Regular 32/40 (28/34 on 390) per the Inter-only rule.

More local components: DS/Profile Card 3:244 · DS/Wordmark Metallic 4:2 (tal logo v2 with silver gradient #FFF → #DBDBDB → #9A9A9A) · DS/Pill Dark Outline 4:8 · DS/Pill White S 4:20 · DS/Pill White L 4:30 (all wrap the imported Button).

## Frames
| frame | 1440 (page 03 / 01) | 390 (page 04 / 02) |
|---|---|---|
| Landing | 4:42 | 5:64 |
| A1 Name | 2:237 | 5:263 |
| A2 Company | 2:294 | 5:340 |
| A3 Title | 2:344 | 5:395 |
| A4 Finding you on LinkedIn | 2:444 | 5:509 |
| A5 Is this you? | 3:275 | 5:571 |
| A5b Not found | 3:448 | 5:663 |
| A5b Rate limited | 3:523 | 5:731 |
| A5b Daily cap | 3:592 | 5:793 |
| A6 Resume (optional) | 3:388 | 5:855 |
| A6b No resume → email | 2:394 | 5:451 |
| A7 Done | 3:661 | 5:917 |

Stills used (round2): fog-hill 16x9 (landing hero 1440), fog-hill 4x5 (hero 390), chair-window 4x5 (Behind Tal card, both), train-rain 16x9 / 4x5 (A7 Done).

Contact sheet: page `00 Contact sheet`, frame 5:1345 (all 24 frames cloned at 25%). Prototype notes: page `05 Prototype`, frame 5:2889.

## Screenshots
`docs/team/figma-shots-v4/`: 00-contact-sheet.png, 01-landing-1440.png, 02-landing-390.png, 03-flow-1440-page.png, 04-flow-390-page.png, DS-kit.png.

## Decisions I made (flag if wrong)
- LinkedIn tile is #222 with a white Inter Bold "in" (the DS reference uses LinkedIn blue; the v4 rule is black, white and silver only). Magnifier drawn in silver.
- Profile photo on A5 is a silver initials disc ("AM"), not a face: no people.
- Company names in the flow (Halcyon Labs, Kestrel Systems, Ardent Robotics) are invented. The chat card says "a Series B payments company" and the reply is "Yes to the payments one" (no Stripe).
- Small copy I wrote where the brief had none: A4 sub, A5 sub "Tal found this profile on LinkedIn.", A5b subs, A6b sub "We’ll email you when a role fits.", chat caption, "Behind Tal" paragraph, How-it-works bodies, terms bodies, first FAQ answer. All interim; the copywriter replaces them in code.
- The DS "Questions?" pill is used on flow headers; on the 390 landing nav only the white CTA pill shows (both did not fit next to the wordmark).
- Mobile flow has no "‹ Back" (DS mobile anatomy: progress under header, CTA pinned at the bottom); "or press ⏎" is dropped on 390.
- Question tracking kept at the token (−0.42). Inter at 32 reads slightly looser than SF Pro in the reference; −0.64 would match by eye if the founder wants it.

## Open questions
1. Hero still: fog-hill is placed; chair-window and dawn-city are the alternates (swap the fill on 4:44 / 5:66).
2. Should the landing show a logo marquee (the MEGA_PLAN mentions 12 verified companies)? Not built, because the brief bans real logos in the hero/chat and lists no verified set.
3. "Who is Tal for?" answer says "San Francisco, the Bay Area or remote" — confirm remote is in scope.

## Prototype
Both flow pages have a flow starting point at A1 ("Tal US · 1440", "Tal US · 390"). Continue → next; A4 auto-advances to A5 after 2.5 s; A5 Yes → A6, No / Paste my link → A5b Not found; Not found Continue → A5, Skip → A6; Rate limited Try again → A4; Daily cap paste → Not found, skip → A6; A6 Continue → A7, "No resume handy?" → A6b → A7; A7 Done → A1; every 1440 "‹ Back" goes to the previous step. Smart animate, ease out, 300 ms.
