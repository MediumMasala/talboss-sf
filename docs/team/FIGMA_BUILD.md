# FIGMA_BUILD · Tal US v4.1

File: Tal US · v4 `QjHT7mWSNvgeAuiQehZZNJ` — https://www.figma.com/design/QjHT7mWSNvgeAuiQehZZNJ
Revision 4.1 (4 Nov 2026, night) applies the founder review in `FEEDBACK_V4.md`. Changed in place: both landing frames, A7 Done on both flow pages, the DS page (three new components), and the contact sheet. A1–A6b are unchanged.

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

## Landing sections, top to bottom (4.1)
| section | 1440 | 390 | notes |
|---|---|---|---|
| We’ve raised bar | 20:964 (36px) | 22:1214 (53px, 2 lines) | glass fill 6% + bottom hairline 12% + 24 blur; 13px `dark/text-sub`; text 20:965 / child of 22:1214 |
| Hero | 4:43 (720) | 5:65 (560) | `art/hero` 4:44 (1440×720) / 5:66 (390×520); scrim 4:45 / 5:67; wordmark 20:966 (160 tall) / 22:1216 (96 tall); sub 4:69 / 5:76; CTA 4:71 / 5:78; fine print 4:78 / 5:80 |
| Logo marquee | 21:964 | 22:1222 | caption 21:965 / 22:1223; track 21:966 / 22:1224 (row instances at 40% opacity + black edge fades) |
| Chat section | 4:79 | 5:81 | glass card 4:80 / 5:82; tal tiles 21:1083, 21:1089, 21:1095 / 22:1303, 22:1309, 22:1315 |
| Behind Tal | 4:123 | 5:119 | white card 4:124 / 5:120; body 4:137 / 5:124; stats row 4:139 / 5:126; product mock 21:1101 / 22:1321 |
| How it works | 4:154 | 5:141 | unchanged |
| The deal | 22:1164 | 22:1392 | card 22:1165 / 22:1393; title 22:1167 / 22:1394; rows 22:1170, 22:1172, 22:1174, 22:1176 / 22:1396, 22:1398, 22:1400, 22:1402; orb slot `art/deal-orb` 22:1168 (1440 only) |
| Questions | 4:195 | 5:182 | unchanged |
| Footer | 4:224 | 5:211 | unchanged |

## A7 Done (4.1)
| node | 1440 (3:661) | 390 (5:917) |
|---|---|---|
| `art/done` | 3:662 (720×900 at x 360, y 140) | 5:918 (390×488, bottom-anchored at y 356) |
| White blends | 23:1368 left, 23:1369 right, 23:1389 top | 23:1745 top |
| Content | 3:676 | 5:921 |
| Name "Aryan Mehta" (`Done/Name 56`, #222) | 3:678 | 5:922 |
| Credit caps (`Landing/Overline`, #6A6A6A) | 3:677 | 5:923 |
| Sub (`Landing/Sub 18`, #6A6A6A) | 3:680 | 5:925 |
| Chips row (San Francisco · Bay Area · Remote) | 23:1373 | 23:1749 |
| Done (Button, Style=Neutral, Large: #222 pill) | 3:682 | 5:927 (full width, pinned at the bottom) |

## DS page additions (1:2)
- **DS/Logo Marquee Row** 18:1395: the 12 verified companies in order (Google, Microsoft, Amazon, Uber, Salesforce, Adobe, LinkedIn, PayPal, Intuit, Spotify, Razorpay, Sarvam), white vectors imported from the repo SVGs (`public/brands/*`, `public/india/companies/{microsoft,amazon,spotify,razorpay}.svg`, `public/india/misc/sarvam.svg`), 48 gap, optical heights 16–24px. Row width 1139. On the page it sits at 40% opacity inside a clipped track with black fades. On 390 the instances are scaled to 75%.
- **DS/Product Mock · Roles** 19:923 (480×600, 4:5): silver panel, a phone running the Tal app (logo tile header, "3 roles that fit you this week", three role rows with a location tag and a white "Yes" pill, glass card with hairlines), and an "Intro sent to the founder" banner in the iOS notification position. Placed at 100% on 1440 and at 310/480 on 390.
- Earlier components unchanged: Logo Tile 2:63 (used, scaled to 32, for every Tal avatar), Wordmark Metallic 4:2 (used for the hero logo), Header/Footer, Pills, Profile Card.

## What changed (4.1)
1. Hero: "Talent." is gone. The metallic tal wordmark (DS/Wordmark Metallic) is the headline: 160px tall at 1440, 96px at 390. It sits in the black sky of the art, with the skyline glowing beneath it. The sub, white pill and fine print sit below the horizon over a radial scrim. Sub: "The talent agent for engineers, researchers, PMs and designers. Now in San Francisco." The fog still is removed. The small nav wordmark is hidden on the landing so the logo appears once; nav pills are right-aligned.
2. Raised bar above the nav, full width: "We’ve raised $7 million from Peak XV (formerly Sequoia Capital)." No icon, no link.
3. Chat card: all three round "t" avatars are now the tal app tile (Logo Tile, tal logo v2 inside, 32px). The "• An illustration" pill is deleted. The thread is unchanged.
4. Logo marquee directly under the hero, caption "BOSSES FROM THESE COMPANIES HIRE ON TAL" (13px tracked caps, 48% white).
5. Behind Tal: new paragraph ("Tal just opened in San Francisco. Behind it is a network of 300,000+ tech professionals and 5,000+ AI and consumer startups, and a team that reads every profile."), two stats only, and the product mock in place of the chair still.
6. The terms grid is deleted. "The deal" replaces it: glass card, title 32/40 left (28/34 on 390), four hairline rows at 18/28. Each row leads in white and continues in 64% white.
7. A7 Done is now white and bright. The dawn art sits under the copy so the sun rises just below the Done pill. Name, credit caps, new sub, three glass chips, black Done pill.
8. The contact sheet (5:1345) has fresh 25% clones of the four changed frames: 24:1122 Landing 1440, 24:1275 Landing 390, 24:1425 A7 1440, 24:1447 A7 390. Its title now reads v4.1.

## Art placed (from `docs/team/art/round3/`, log ends DONE; files chosen by the coordinator)
| slot | node | file |
|---|---|---|
| `art/hero` 1440 | 4:44 | `particle-horizon-a-16x9.png` |
| `art/hero` 390 | 5:66 | `particle-horizon-a-4x5.png` |
| `art/done` 1440 | 3:662 | `horizon-dawn-b-4x5.png` |
| `art/done` 390 | 5:918 | `horizon-dawn-b-4x5.png` |
| `art/deal-orb` (1440, optional accent) | 22:1168 | `chrome-orb-b-4x5.png` |

Not used: `silk-light-b-16x9.png` behind Questions. The bright silk made the accordion text hard to read, so I left it out.

## Screenshots
`docs/team/figma-shots-v4/`: 00-contact-sheet.png, 01-landing-1440.png, 02-landing-390.png, 03-flow-1440-page.png, 04-flow-390-page.png (all overwritten for 4.1), plus new 05-a7-done-1440.png, 06-a7-done-390.png, 07-product-mock-roles.png. DS-kit.png is from v4.

## Notes for the frontend engineer
- The raised bar is pinned: `position: sticky; top: 0` above the nav. The Figma frame is auto-layout, so it is drawn as the first child, not as a fixed layer.
- Hero logo: render the SVG wordmark with the `brand/metallic` gradient (#FFF → #DBDBDB at 45% → #9A9A9A). Keep it in the top 40% of the art, which is pure black.
- Hero art: `object-fit: cover`, centred. The scrim has two layers: a linear one (50% black at the top for the nav, clear through the middle, 100% black at the bottom edge) and a radial one (about 78% black) behind the sub and CTA.
- Marquee: one row duplicated for an infinite scroll. Logos at 40% opacity; fades 320px (1440) and 24/96px (390), solid black for the first 30%.
- A7: the art must melt into #FFF. Use the white linear blends on the top and sides as drawn, or a CSS mask.
- When the user scrolls past the hero logo, the nav wordmark can fade back in.

## Decisions I made (flag if wrong)
- The nav wordmark is hidden on the landing so "tal" never appears twice in the first viewport.
- On 390 the raised bar wraps to two lines (53px), because the exact Peak XV line does not fit 342px at 13px. The break is after "Peak XV".
- The product mock is a phone, not an email. Role locations: Staff engineer → San Francisco, Founding engineer → Remote, ML engineer → Bay Area. The banner shows the next beat ("Intro sent to the founder. They’ll write to you directly.").
- The A7 name is 56/64 on 390 too (per the brief). "Aryan Mehta" fits 342px. A long name would need the 36/42 `Landing/H1 390` fallback in code.
- The black Done pill is the DS Button `Style=Neutral, Size=Large` (#222, bound to the library variable). That is the primary pill used in the flow.
- The orb accent is on 1440 only. On 390 the deal card is text only, to keep it short.
- Footer still carries "We have raised $7 million…" next to ©. Now that the bar exists it is redundant, but `site.ts` says top bar and footer, so I left it.

## Open questions
1. Chat card (L2) and the product mock (Behind Tal) both show "3 roles that fit you this week". Keep both? The chat tells the story, the mock shows the product. My lean: keep both and change the chat opener to something else in code.
2. Should the footer funding line go now that the bar is always visible?
3. Should the nav wordmark fade in on scroll (my recommendation), or stay hidden?
4. `og` text in `site.ts` still says "Talent." and describes a black-and-white photograph. It should follow the new hero (the coordinator's `og-a-1200x630.jpg` exists in round3).

## Prototype
Unchanged from v4. Both flow pages start at A1 ("Tal US · 1440", "Tal US · 390"). Continue → next; A4 auto-advances to A5 after 2.5 s; A5 Yes → A6, No / Paste my link → A5b Not found; Not found Continue → A5, Skip → A6; Rate limited Try again → A4; Daily cap paste → Not found, skip → A6; A6 Continue → A7, "No resume handy?" → A6b → A7; A7 Done → A1 (the Done instance kept its reaction through the variant swap); every 1440 "‹ Back" goes to the previous step. Smart animate, ease out, 300 ms.
REVISED 4.1 DONE
