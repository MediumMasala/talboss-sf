# Tal Web Design System · tokens we build with (extracted 4 Nov 2026 from UzuMTGlnXwYMDTxlnSyfmT)

Cover line of the system: **Black & white · Inter · Airbnb-derived geometry and elevation · Boss web.** (The Figma file uses SF Pro; on the web that is the system stack `-apple-system, BlinkMacSystemFont, "SF Pro"` with **Inter** as the fallback. Never self-host SF Pro.)

## Surfaces (greys)
| token | hex | use |
|---|---|---|
| surface/000 | #FFFFFF | light canvas, cards on dark |
| surface/300 | #EBEBEB | progress track, hairlines on light |
| surface/400 | #DDDDDD | outline pill border |
| surface/600 | #8C8C8C | helper text |
| surface/700 | #6A6A6A | secondary text on light |
| surface/1000 | #222222 | primary text, black pill fill, progress fill |
| surface/1100 | #000000 | hero-field value, dark canvas |

Dark landing (Select landing v2): canvas #000 → #0B0B0B; glass card fill rgba(255,255,255,0.06) with 1px rgba(255,255,255,0.12) hairline, radius 24, soft elevation; white pill CTA (text #111); secondary text rgba(255,255,255,0.64); silver gradient wordmark (#FFFFFF → #9A9A9A, metallic highlight); white rounded card (radius 28) for the "network" block with phones and 4 stats separated by hairlines; numbered steps "01 · 02 · 03" in small caps with hairline dividers.

## Type (SF Pro / Inter)
| role | size/line | weight | tracking |
|---|---|---|---|
| Onboarding question | 32/40 | Medium | −0.42 |
| Hero field value | 32/40 | Regular | −0.42 |
| Sub | 16/24 | Regular | −0.04 |
| Button L | 16/24 | Medium | −0.04 |
| Body 14 | 14/20 | Regular/Medium | 0 |
| Helper 13 | 13/20 | Regular/Medium | +0.01 |
| Landing H1 (Select v2) | 56/64 desktop, 36/42 mobile | Semibold | −1.5 |
| Giant wordmark | 320+ | Bold | tight |

## Spacing · radius · elevation
xxxs 1 · xxs 2 · xs 4 · m1 8 · m2 10 · m3 12 · m4 16 · xxl 32 · xxxl 40. Pill radius 9999. Card radius 16 (menus), 24 (glass), 28 (white hero card). Shadow (dropdown): 0 8 24 @10%. Shadow (visual tile): 0 10 24 @14%.

## Components (Boss Design System library, key for `importComponentSetByKeyAsync`)
- Button · set `f5e134ed04dbc4952b7feca4cc33341e156de0b9` — primary: #222 fill, white label 16/24 Medium, px 40 py 12, pill. Outline: white fill, 1px #DDD, label 13/20 Medium, p 8.
- Icon Button · `ccd4754b77e06ddd3652e90986bd0c837ca96979`
- Input / Hero Field · `81c17311df07e6e1b2e26e8ca01e237073cb99de` — borderless centred 32px input, 2px cursor, helper 13 #8C8C8C. States Empty/Typing/Filled/Error.
- Semented Control Tab · `7cdc0def47675f130a79b3f747f8f9541d5e671c` (the Tal Boss / Tal Select pill toggle)
- tal logo v2 · set `7029d544abccee3626b318e81c22873104f6ebf3`
- Library key: `lk-ff6129adcf03e2194279c00b484195579310b09521d6096cdcff2c2caae7ca3fb12282b2c689b497163755cbee6dfad2f437f8fb80b6f6389e469dd3b539edae`

## Onboarding frame anatomy (1440×900, from A3/A6)
- Header 88px: logo tile 44.64px at x 48; right: outline pills "Questions?" (and "Save & exit").
- Content: centred column 560 wide, vertical gap 32: question (32/40 Medium #222, centred) + sub (16/24 #6A6A6A) gap 10 → hero field (361 wide) → black pill "Continue" + "or press ⏎ to continue" (13/20 #6A6A6A) gap 12.
- Footer 88px at y 812: 2px segmented progress (5 segments, gap 8, #EBEBEB track, #222 fill) + "‹ Back" text pill at x 48.
- "Finding you on LinkedIn": 200×152 visual (LinkedIn tile 104px radius 24 with shadow + magnifier), title, sub, 320×6 track radius 3 with #222 fill + "48%" 14 Medium, "This might take a minute, hang tight" 14 #6A6A6A.

## Mobile (390)
Same anatomy, 24px side padding, question 28/34, hero field 28px, CTA pinned above keyboard, progress 2px at top under the header.
