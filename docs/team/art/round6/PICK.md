# Round 6 pick: "The fog is thinking"

Direction: `docs/team/HERO_DIRECTION.md`. Model `gemini-3-pro-image` at 4K (16:9 = 5504 × 3072, 4:5 = 3712 × 4608). Prompts and every pass: `PROMPTS.md`. All takes with verdicts: `sheet.jpg`.

## 6c: more SF (current hero: `fog-g1-16x9.png` + `fog-g1-4x5.png`)

The founder on 6b said: "LOVE THE HERO CREATIVE... any way to make the city look more like SF?" 6c changes only the city. The coder, bench, fog, Sutro and grade are all the same as 6b.

**How it was made:**
- **City-only edit on a person-free plate.** gemini-3-pro-image 4K made reference edits of the 6b clean plate (`raw/fog-clean-*.png`, the 6b plate without the coder), three takes per crop. The prompt is in PROMPTS.md, "Round 6c". Because the person wasn't in the edited plate, the model could not move them.
- **Same coder seated back on.** The same coder and bench were composited back with `round6b-composite.py --plates 16x9=fog-sf-16x9-a.png,4x5=fog-sf-4x5-b.png --tag g1`. That places them with the same code at the same place and size.
- **Same grade, plus one veil.** The 6b grade (filaments, de-paint) runs as before. A new `--veil` softens the distant downtown, pulling its detail 50 % and its contrast 35 % toward the fog, so it stays small and soft.

**Picks:**
- **16:9 take `a`.** It adds a low downtown silhouette far right in the fog: one slim tall tower (Salesforce-like) and one small pyramid spire (Transamerica-like), plus a few low blocks at x ≈ 0.80–0.94, y ≈ 0.38–0.46. The grid streets now run downhill toward it, with one bright straight street (the cable-car-like line) near x 0.52. It kept the fog filaments. Take `b` lost the filaments (the fog changed, so rejected). Take `c` drew the downtown too large, so the eye went there first.
- **4:5 take `b`.** It has the clearest Salesforce + pyramid pair, small at the top right, and a faint thin line of East Bay lights across the left at y ≈ 0.44. Take `a`'s towers are generic. Take `c` has a ladder-like light line.

**Would a San Franciscan name it?** Yes, and the frame now hangs together geographically. Sutro is on the western ridge with the fog pouring over Twin Peaks, the grid of row-house streets runs down below, and downtown sits far right in the fog. That is the view west from Bernal Heights over Noe Valley and the Mission, so "Bernal, looking at Sutro and the fog" is the likely answer.
- **Honest limit:** the bay-windowed Victorians are only suggested, not legible, at 1440. The model held the city's layout and brightness as asked and mostly re-textured the houses. The SF read comes from Sutro, the downtown pair, the fog and the street grid.
- **Geography slip on 4:5:** the faint East Bay line sits on the left. From Bernal looking west the East Bay would be behind you, but it is faint enough to read as the distant shore.

**Unchanged, measured against 6b (graded, 8× down):**

| region | 16:9 | 4:5 |
|---|---|---|
| sky + tower (y < 0.33) | 0.5 | 0.3 |
| fog band (x < 0.78) | 2.3 | 3.4 |
| city (changed on purpose) | 5.6 | 4.0 |
| grass | 1.4 | 1.7 |

The figure box is identical: 16:9 x 0.152–0.267, y 0.585–0.700; 4:5 x 0.136–0.362, y 0.598–0.700. The laptop did not move, so `paths.json` is unchanged.

**Measurements:**

| | 16:9 | 4:5 | target |
|---|---|---|---|
| R = G = B | yes | yes | |
| top 35 % mean | **6.9** | **3.4** | ≤ 8 |
| lower-centre third mean | **16.0** | **19.3** | ≤ 20 |
| fog peak | **230** (p99.9 225) | **230** (p99.9 224) | ≤ 230 |
| fog band mean | 121.7 | 114.9 | luminous |

**Exports:**
- **Hero:** `public/art/hero-16x9-{1440,2880,3840}` (AVIF 53 / **126** / 196 KB) and `hero-4x5-{800,1600}` (AVIF 35 / 81 KB), all from `fog-g1`.
- **OG:** `og-c-1200x630.jpg` is a 1.04× push-in (1250 wide, crop x0 y20), so the tower clears the "l" and the downtown stays in frame. It feeds `app/opengraph-image.jpg`, and the alt text now mentions "downtown faint in the fog".
- **Name clash:** `raw/fog-g1-16x9-{a,b,c}.png` are the older 6b placement-box edits, one of which is the coder source. The 6c picks are the top-level `fog-g1-*.png`. The 6c city edits are `raw/fog-sf-*`.

---

## 6b (superseded by 6c): coder on a bench (`fog-f1-16x9.png` + `fog-f1-4x5.png`)

The founder on `fog-e1` asked, "Why is a depressed guy looking over a hill?" The first instruction was to remove the person. It was overridden before review: "show them as a coder with a MacBook (subtly visible) coding on a bench and overlooking SF." 6b is that frame. The fog, the city and the tower are the `fog-e1` plates.

**How it was made**
- **Edits alone didn't work.** gemini-3-pro-image edits of `fog-e1` drew the coder well, but always at the wrong size. That held for `c1` (direct replace) and for `g1` (a grey placement box painted at the exact size). Coder and bench came out at 20–30 % of the frame height, often moved right, and the whole scene was re-rendered a little.
- **So the frame is a composite.** `scripts/art/round6b-composite.py` builds it in three steps:
  1. **Clean plate.** It starts from the raw `fog-e1` plate. Only the old figure's box (feathered) is replaced by the figure-removed edit `raw/fog-rm-*-a.png`, so everything else is `fog-e1` pixel for pixel.
  2. **Matte.** It mattes the coder and bench out of `raw/fog-g1-16x9-a.png`, using its difference from the clean plate it was edited from. The head and neck are filled by row, and the laptop screen is dimmed to about 30 % above 70/255.
  3. **Scale and place.** It scales the subject **down** (×0.36 on 16:9, ×0.48 on 4:5, never up) and seats it on the crest. The same person goes into both crops.
- **Change outside the subject**, measured against the graded `fog-e1` at 8× down: mean 0.45/255, p99 5.2 on 16:9; 0.40 and 4.7 on 4:5. That remainder is the grain added below.

**The figure**

| | 16:9 `fog-f1-16x9.png` | 4:5 `fog-f1-4x5.png` | rule |
|---|---|---|---|
| person (body + laptop), x | **0.190–0.241, centre ≈ 0.215** | **0.211–0.311, centre ≈ 0.24** | 16:9 x 0.20–0.24, clear of the copy column (desktop sub spans x 0.28–0.72) |
| person + bench box | x 0.152–0.267, y 0.585–0.700 | x 0.136–0.362, y 0.598–0.700 | |
| height (head top → bench feet) | **11.5 % of the frame** (head top y 0.585, feet on the crest at 0.700) | **10.2 %** (head top 0.598) | ≤ 14 % |
| laptop | x 0.221–0.239, y 0.633–0.659 | x 0.272–0.308, y 0.641–0.663 | subtly visible, dimmer than the fog |

- **The person:** seen from behind and three-quarter back, sitting upright, leaning in, typing on a plain slim silver laptop on their lap. Hood down, short hair rim-lit by the fog. The bench faces the city. No face is visible: an ear and the edge of the cheek in silhouette, about 6 px at 1440. There's no logo, no readable screen and no text.
- **The screen** is a soft grey (≈ 90–110/255), well under the fog's 220s.

**Grade** (`round6-grade.py`, the same curve as 6a, with Steve's round-4 addendum):
- **Filaments softened.** `--filaments 0.38,0.38,0.80,0.58`: the fine detail in that box is pulled 36 % toward a 5 px gaussian. Filament detail (band-pass 1–6 px) measures 4.74 → 3.41, **28 % softer**. The 4:5 has almost no filaments, so the same pass there doesn't measurably change them.
- **Houses de-painted.** `--depaint 0.44,0.71`: a 0.6 px soften plus fine 1 px luminance grain (σ 4.5/255, mid-tones only) in the city band. It breaks up the smooth painted look at 200 % and moves nothing.

**Measurements**

| | 16:9 | 4:5 | target |
|---|---|---|---|
| R = G = B | yes | yes | |
| top 35 % mean | **6.3** | **3.0** | ≤ 8 |
| lower-centre third mean | **15.3** | **18.1** | ≤ 20 |
| peak | **230** (p99.9 225) | **230** (p99.9 222) | ≤ 230 |
| fog band mean | 120.8 | 113.4 | luminous |
| crest | ≈ 0.69 | ≈ 0.69 | |

**Paths** (`paths.json`, rewritten): each path starts in the fog's bright interior, as before, and now **ends at the coder's laptop**. That is the last point of every path: 16:9 `[0.232, 0.645]`, 4:5 `[0.290, 0.650]`. The last segments come in from the right over the city, just above the bench back, so the light arrives at the screen in their hands. The person sits at 16:9 `[0.207, 0.672]` (seat) and 4:5 `[0.240, 0.675]`.

**Exports:** `public/art/hero-16x9-{1440,2880,3840}` (AVIF 51 / **121** / 187 KB) and `hero-4x5-{800,1600}` (AVIF 30 / 70 KB), from `fog-f1`. OG: `og-b-1200x630.jpg` (same push-in as 6a) → `app/opengraph-image.jpg`, with new alt text.

The frontend note from 6a still stands. With today's 1440 × 720 layout, the sub starts on the lit city above the crest. Drop the copy block about 50 px, or anchor the plate to the bottom.

---

## 6a (superseded): `fog-e1-16x9.png` (desktop) + `fog-e1-4x5.png` (phones)

`fog-e1` is take `r2`, recomposed from pass 3 take `w`, with one local edit: the laptop lid is closed. `e2` is the same edit rerun and is the runner-up.

Why this one:

- **It is the doc's frame.** One young person in a hood sits small on a level crest, far left, seen from behind. The fog pours over the western ridge, and the Sutro silhouette rises out of it. The city is a carpet of small houses on steep streets. There are no tall buildings, bridges or text, and no face.
- **The light finds the person.** The fog's brightest body runs from the upper right, down and to the left, toward the figure. Where it spills into the city, it breaks into fine glowing filaments. The pulses only have to follow a direction the picture already has.
- **It is luminous, not morose.** The fog is the light source. It floods the valley and rims the hood, and the city below glows through it. The dark is all in the sky and the grass, where the copy sits. The person is watching something arrive, not sitting alone in the wet.
- **The layout works.** The figure is clear of the copy column, the top of the frame is black for the wordmark, the glow sits right under "tal", and there is a wide band of black grass for the sub and the pill.

Rejected: 32 other 16:9 takes. Three text-only passes (24 takes) never met the layout. The person was 15–40 % of the frame height (the reject line is 14 %) and sat at x 0.25–0.34. Most takes had an open laptop, four showed a face in profile, two had a colour cast and three had black borders. Pass 4 recomposed the best-lit takes from a reference image, and only `r2` met the layout, with its laptop lid up. Pass 5 closed the lid. The verdict for every take is under it on `sheet.jpg`. No take showed text, a logo, a bridge, the pyramid or downtown towers, a glowing screen, or dots or nodes.

Watch-outs:
- The filaments are more visible than "only on a second look". They read as organic fibres, not as a network diagram (no nodes, no straight lines). Up close they can look a little electric. The fog-breath shader will soften them. If Steve wants them quieter, a mask-limited blur in the grade is a five-minute change.
- The ridge sits at ≈ 0.36, not 0.42, and the crest at ≈ 0.69, not 0.66. The model would not place them lower without making the person bigger. The top fade keeps the top 35 % black anyway.
- The tower sits at x ≈ 0.60, just right of the wordmark. It reads only against the fog at its base, because the sky behind it is graded to black.
- 200 % zoom: the city's houses have a slightly painted texture in places (the model's 4K detail). There's no smearing on the figure, the laptop or the tower.

## 4:5: take `a` → `fog-e1-4x5.png`

This frame was made from the graded `fog-e1-16x9.png` as the reference, using the doc's instruction (plus "head at 52 %"). It keeps the same person, hood, closed laptop and fog river, with the tower at the top right. Take `b` is rejected: its ridge sits at 0.50, the city fills the lower third (mean 40/255) and the figure (head at 0.66) would sit inside the phone copy, which runs at image y ≈ 0.68–1.0.

## Measurements (on the graded plates; `python3 scripts/art/round6-grade.py measure <file> <crop>`)

| | 16:9 `fog-e1-16x9.png` | 4:5 `fog-e1-4x5.png` | doc target |
|---|---|---|---|
| size | 5504 × 3072 | 3712 × 4608 | 4K, never upscale |
| R = G = B | yes (every pixel) | yes | true greyscale |
| top 35 % mean | **6.3 / 255** | **3.0 / 255** | ≤ 8 |
| lower-centre third mean (x ⅓–⅔, y ⅔–1) | **15.3 / 255** | **18.1 / 255** | ≤ 20 |
| dark grass under the crest (x 0.30–0.70, y 0.71–0.95) | mean 7.6, p95 23 | — | — |
| fog peak (whole frame) | **224 / 255** | **224 / 255** | ≤ 230 |
| fog band mean (y 0.33–0.62 / 0.33–0.58, x 0.1–0.9) | 120.5 | 113.3 | luminous |
| figure x (body, fraction of width) | **0.192–0.241, centre 0.216** | **0.110–0.209, centre 0.159** | 0.20 / 0.24 |
| head top / seat (y) | 0.582 / 0.697 (height ≈ 11.5 %) | 0.591 / 0.697 | head 0.56 / 0.52, height ≈ 10 %, reject > 14 % |
| crest (y, left → right) | 0.70 → 0.66 (≈ 0.69 under the figure) | 0.69 → 0.67 | 0.66 / 0.62 |
| ridge (y) | ≈ 0.36 (fog crest to 0.31 at the far right) | ≈ 0.35 | 0.42 / 0.40 |
| tower (x, y span) | x 0.60, y 0.25–0.32 | x 0.89, y 0.27–0.33 | — |

Contrast for the sub (white/72): on the dark grass under the crest it is ≈ 10:1 at the mean (≈ 9.6:1 at p95), which passes 4.5:1. **Frontend note:** with today's layout (1440 × 720, cover), the sub starts at image y ≈ 0.636, which sits on the lit city just above the crest (copy box mean 42.7, local lights above 200, so it fails there). The crest lands at ≈ 513 px in the 720 px hero. Either drop the copy block about 50 px, or anchor the desktop plate to the bottom (`object-position: 50% 100%`, which puts the crest at ≈ 471 px). On phones (520 px plate) the copy runs at image y ≈ 0.68–1.0, all on grass under a 0.69 crest.

## Pulse paths: `paths.json`

Three polylines per crop, in image fractions `[x, y]` of the source plate (apply the same object-cover maths as the `<picture>`). Each one starts in the fog's bright interior and runs down through the fog and the lit city. The last two points run along the crest to **the point where the person sits**, which is the last point of every path: 16:9 `[0.216, 0.697]`, 4:5 `[0.160, 0.697]`. The arrival runs along the crest, not across the body, so the lift never paints over the silhouette.

- 16:9: path 1 is the upper fog river from the far right (0.90, 0.36). Path 2 runs through the filaments (0.74, 0.42). Path 3 is the lower spill across the city (0.84, 0.45).
- 4:5: path 1 is the fog river from the right edge (0.95, 0.41). Path 2 is the lower city (0.80, 0.52). Path 3 is the near fog (0.62, 0.47).

## Exports (`node scripts/art.mjs`)

`public/art/hero-16x9-{1440,2880,3840}.{avif,webp}` (AVIF q 72: 52 / **116** / 165 KB; WebP q 82: 50 / 112 / 157 KB) and `hero-4x5-{800,1600}.*` (AVIF 31 / 68 KB). The 2880 AVIF is 116 KB, under the 450 KB budget. The script never upscales. The Done, orb and wall exports are unchanged. The old round-5 files (`hero-16x9-{640,1024,1376}`, `hero-4x5-{480,768,928}`) are still in `public/art/`, because `components/landing/Hero.tsx` references them. Delete them when the frontend switches the srcset.

OG: `og-a-1200x630.jpg` is the 16:9 pick with a 1.1x push-in (1320 wide, crop x22 y15), so the tower clears the "l". `node scripts/og.mjs` builds `app/opengraph-image.jpg` and `app/opengraph-image.alt.txt`.
