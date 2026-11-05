# Round 5 pick

## Hero: `valley-isometric-b` (16:9 + 4:5)

`valley-isometric-b-16x9.png` on desktop, `valley-isometric-b-4x5.png` on phones. Already live in `public/art/hero-*` via `scripts/art.mjs`.

Why this one:

- **It is the brief.** The valley is a quiet silver model city at night, and a handful of campuses and towers glow from inside, spaced down the peninsula like landmarks. That is "companies rise as landmarks" said in our own voice: night, silver, very high, no logos, no colour, no toy city. It does not look like the title sequence.
- **It reads as the Bay at a glance.** The bay is a dark wedge, both bridges are thin bright wires, downtown SF sits at the near end, and the shore runs off to a glow at San Jose. At 1440 it is plainly the Bay Area, not "a city".
- **It fits the page as laid out.** The top third is black (16:9 top 35 %: mean 2 of 255). The San Jose glow sits right under the wordmark and backlights it. The sub line and the CTA land on the black water of the bay, so the copy stays legible without a heavier scrim.
- **It is subtle.** Most of the land is dim grey blocks and only about six things glow. That is "more than a black and white outline, less than a billboard".
- **The frontend can light it up.** The lit landmarks are real points in the picture (`hubs.json`), so a soft pulse over SF, Palo Alto, Mountain View, Sunnyvale and San Jose lands on something.

Watch-outs: on the 16:9 the Pacific on the right is a flat grey plane with a hard top edge at 35 % (it reads as the edge of the model). At 1440 the nav scrim and the page edge hide most of it. If it bothers the founder, a right-edge vignette in CSS fixes it. On the 4:5 the far shore starts at 29 % and is faded to near-black behind the mark.

Runner-up: **`bay-aerial-b`**, a photographic night aerial in silver. It is the quietest and most "real", but it has no landmarks to light, so it reads as a beautiful stock aerial rather than the valley.

## Numbers wall background: `valley-nodes-a`

Use `valley-nodes-a-16x9` on desktop and `valley-nodes-a-4x5` on phones (exported as `public/art/wall-{16x9,4x5}-*`, not wired yet). Run it full-bleed behind the grid at about 15–25 % opacity on black. It is the darkest frame in the set (mean 14 of 255): a barely-there map with a few bright nodes joined by hairlines. Behind a wall of headcounts it says "a network of people" without competing with the numbers, and it shares the hero's camera, so the page feels like one place. Fade it out under the densest block of numbers if any digit sits on a node.

## Hubs

`hubs.json` has x/y (fractions of the source image) for SF, Palo Alto, Mountain View, Sunnyvale and San Jose on both hero crops. It also has the object-cover maths for the desktop and phone boxes. The render is stylised, so each point sits on the lit landmark nearest the real town, not on true map coordinates.
