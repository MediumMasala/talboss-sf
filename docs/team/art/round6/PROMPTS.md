# Round 6 prompts: "The fog is thinking"

Direction: `docs/team/HERO_DIRECTION.md` (Steve, 5 Nov 2026). Model `gemini-3-pro-image`, `imageConfig.imageSize: "4K"`, via `scripts/art/gen.mjs`. Jobs built by `scripts/art/round6-jobs.py`.

Every 16:9 take = the doc's prompt, verbatim, plus one variation sentence (time of night, fog density, figure x within 18–22 %). Nothing else changes.

## Base prompt (16:9, verbatim from HERO_DIRECTION.md)

A 35mm film still from an independent drama, night in San Francisco. The camera is low on the dry grass at the top of a steep city hill, looking out across the city toward the long western ridge. The dark crest of the hill runs almost level across the bottom third of the frame. On the crest, about one fifth of the way in from the left edge and small (about one tenth of the frame height), a young person sits alone on the grass with their knees drawn up and arms around them, seen from behind and slightly to the side, in a plain hoodie; a closed laptop lies on the grass beside them. Their face is not visible. They are completely still, watching the fog. Below them the city fills the valley as a carpet of soft white lights: rows of small houses on steep streets, no tall buildings in view. Beyond the city, a thick river of fog pours over the dark ridge on the horizon and spills slowly down into the city, glowing from inside, lit by the city beneath it, luminous white and silver. Where the fog is nearest, its edge breaks into countless very fine glowing filaments, like mycelium or neurons, so delicate they are only noticed on a second look. On the ridge a tall three-pronged broadcast tower rises out of the fog as a dark silhouette. The ridge sits at about 42 % of the frame height. Above it the night sky is pure black and empty, with no stars and no moon. The fog's glow is the brightest thing in the image, just below the ridge in the centre. The lower centre of the frame is the dark grass of the hill, almost black, smooth and empty. The only light is the city and the glowing fog, with a faint rim of fog light on the person's shoulders and hair. Strictly black and white: deep blacks, silver greys, soft whites, no colour cast. 40mm lens, natural, quiet, intimate, a little melancholy and hopeful; very fine film grain, gentle halation around the brightest lights, no HDR, no glossy CGI look. Wide 16:9. No text, letters, signs, logos, bridges, skyscrapers or landmarks other than the broadcast tower; no other people, no glowing screen, no stars, no sci-fi, no holograms, no circuit patterns, no dots or particles, no lens flare.

## Variations

| take | time of night | fog | figure x |
|---|---|---|---|
| `fog-a-16x9` | late evening, the city still awake | a thick, full river of fog | about 20 % |
| `fog-b-16x9` | just after midnight | a dense, slow-moving bank of fog, generous and bright | about 19 % |
| `fog-c-16x9` | the small hours, the city quiet | a lighter, thinner fog in soft veils | about 21 % |
| `fog-d-16x9` | late evening | a towering, heavy wave of fog cresting the ridge | about 18 % |
| `fog-e-16x9` | just after midnight | a medium fog, soft and even, glowing warmly white from within | about 20 % |
| `fog-f-16x9` | the small hours | a thick fog that has already spilled halfway down into the city | about 22 % |
| `fog-g-16x9` | late evening | a dense, luminous fog bank so bright it lights the whole valley gently | about 20 % |
| `fog-h-16x9` | just after midnight | a thinner, wispy fog with the city lights glowing up through it | about 19 % |

## Pass 2 (re-roll, takes i–p)

Pass 1 failed the doc's placement on every take: the person was 20–30 % of the frame height (reject above 14 %), sat at x 25–30 %, the ridge came in at ~33 % instead of 42 %, and six of eight showed an open laptop. Pass 2 runs the same eight variations (i = a, j = b, … p = h) with one extra sentence that restates the doc's own placement:

Scale and placement are critical: this is a wide shot and the person is far from the camera, about twenty metres away, so they are tiny in the frame, their whole seated body no more than one tenth of the frame height and very narrow; their head is just above the middle of the frame. The crest of the hill they sit on runs nearly level across the whole width at about two thirds of the way down the frame, with a wide band of dark, empty, out-of-focus grass in front of it filling the bottom third. The ridge and the fog are at 42 % of the frame height, not higher. The laptop is shut, lying flat on the grass, its lid closed.

## Pass 3 (re-roll, takes q–x)

Pass 2 still drew the person at 17–23 % of the frame height, and three takes (n, o, p) came back with black borders baked in. Pass 3 runs the same eight variations (q = a … x = h) and swaps the pass-2 sentence for relative size anchors the model can see in the frame:

Scale is the most important thing in this picture: the person is a tiny, distant figure, far smaller than you expect. Seated, they are shorter than the broadcast tower looks on the far ridge, and only about as tall as two of the small houses in the city below look from here. The frame is about forty times as wide as their shoulders. Huge empty space around them: the hill, the city and the fog dominate, the person is a small dark shape on the crest, about one fifth of the way in from the left, their head just above the middle of the frame. The crest runs level across the frame at about two thirds of the way down; the bottom third is a wide band of dark, empty grass. The fog-covered ridge is at 42 % of the frame height. The laptop is shut, lying flat on the grass. The image fills the frame edge to edge, with no border.

## Pass 4 (recompose from a reference, takes r1–r8)

Three text passes never met the layout: the person sat at x 0.27–0.34 (inside or touching the copy column) and the ridge at ~0.30–0.33. Pass 4 hands the best-lit earlier takes back as the reference image, the same way the doc builds the 4:5, with this instruction in front of the doc prompt (verbatim):

Recompose this exact scene, same kind of person, same fog, same tower, same light and film look, for a wide 16:9 frame with this exact layout: the camera has stepped back so the person is small and sits far to the left, one fifth of the way in from the left edge (well left of the centre third), their seated body about one tenth of the frame height, their head at 56 % of the frame height; the crest of the hill runs level across the frame at 66 %; the fog-covered ridge and the tower base are at 42 %; the top 35 % of the frame is pure black empty sky (only the slim dark tower may rise into it); the fog's glow is brightest just under the ridge in the centre; the lower centre third is dark, smooth, empty grass. The laptop is shut and lies flat. Fill the frame edge to edge, no border.

Seeds: r1 ← fog-w, r2 ← fog-w, r3 ← fog-r, r4 ← fog-r, r5 ← fog-i, r6 ← fog-i, r7 ← fog-j, r8 ← fog-l.

## Pass 5 (local edit of r2, takes e1–e2)

r2 met the layout but its laptop lid was up. Reference = `raw/fog-r2-16x9.png`; prompt:

Edit this photograph. Change only one thing: the laptop on the grass beside the person is closed, its lid shut, lying flat on the grass as a thin dark slab. Keep everything else exactly the same: the same person in the same pose and place, the same hood, the same fog, filaments, tower, city lights, grass, framing, grain and black-and-white film look. No text, no glowing screen.


## 4:5 (reference image = the chosen 16:9, graded: `fog-e1-16x9.png`; takes `fog-e1-4x5-a`, `-b`)

Recompose this exact scene, same person, same fog, same tower, for a vertical 4:5 phone frame: ridge at 40 %, crest at 62 %, person at 24 % from the left, top 35 % pure black. The person stays the same small size relative to the city, their head at 52 % of the frame height. Keep the same 35mm black-and-white film look, the same grain and the same light: the glowing fog is the brightest thing, just under the ridge in the centre; the lower centre is dark, empty grass. The person stays small, seen from behind, face not visible, the closed laptop beside them. No text, logos, bridges, skyscrapers, stars, glowing screen, dots or particles.

## Round 6b, first instruction: figure removed (takes rm-16x9-a/b, rm-4x5-a/b)

Founder verdict on fog-e1: "Why is a depressed guy looking over a hill?" The person is out. Reference = the raw pick plates (`raw/fog-e1-16x9.png`, `raw/fog-e1-4x5-a.png`), then the same grade. Prompt:

Edit this photograph. Remove the seated person and the laptop on the grass completely. Where they were, the dark grass of the hill crest simply continues, and behind it the lit city continues exactly as it would, with no trace, no shadow, no outline and nothing put in their place: no other person, no object, no rock, no bench. Keep everything else exactly the same, pixel for pixel: the same fog, the same glowing filaments, the same tower, the same city lights and houses, the same ridge, sky, grass, framing, grain and black-and-white film look. No text.

Superseded before review by the founder's next instruction (below); the removal takes stay in `raw/fog-rm-*`.

## Round 6b: coder on a bench (takes c1-16x9-a/b/c, c1-4x5-a/b/c → `fog-f1-*`)

Founder: "show them as a coder with a MacBook (subtly visible) coding on a bench and overlooking SF". Reference = the raw pick plates. Prompt:

Edit this photograph. Replace only the hunched, hooded seated person and the laptop on the grass with this: a young person sitting upright and engaged on a simple, plain wooden park bench on the crest of the hill, in the same place and at the same small size (no taller than the original figure), seen from behind and slightly three-quarter from the back, so their face is not visible. The bench faces away from the camera, toward the city and the fog. Their hood is down; short hair, rim-lit by the glow of the fog. A slim plain silver laptop is open on their lap and they are typing, absorbed, the posture of someone building something: shoulders open, back straight, leaning slightly toward the screen. The screen is dim and seen from behind: only a very faint, soft glow on their hands and the edge of their cheek, much darker than the fog, no visible screen content, no logo on the lid. Keep everything else exactly the same: the same fog, the same glowing filaments, the same tower, the same city lights and houses, the same ridge, sky, grass, framing, grain and black-and-white film look. No text, no logos, no other people.

### Pass 2 (g1): placement box

The c1 edits drew the coder at 20–26 % of the frame height and moved them right, toward the copy column. Pass 2 edits the clean plate (`raw/fog-rm-*-a.png`) with a flat grey placement box painted at the exact size and place (`raw/guide-16x9.png`: x 0.165–0.265, y 0.585–0.700; `raw/guide-4x5.png`: x 0.08–0.255, y 0.587–0.700). Prompt:

Edit this photograph. Replace the flat grey rectangle with a young person coding on a simple, plain wooden park bench, drawn to fill exactly the rectangle's area and no more: the bench's legs stand on the grass of the crest at the rectangle's bottom edge and the top of the person's head is at the rectangle's top edge. Seen from behind and slightly three-quarter from the back, so the face is not visible; the bench faces away from the camera, toward the city and the fog. Hood down, short hair rim-lit by the fog's glow. They sit upright and engaged, shoulders open, leaning slightly toward a slim plain silver laptop open on their lap, typing: someone building something. The screen is seen from behind; only a very faint soft glow touches their hands and the edge of their cheek, much darker than the fog; no screen content, no logo. Remove the grey rectangle completely: the lit city shows around the person and through the gaps of the bench. Keep everything else exactly the same: the same fog, filaments, tower, city lights and houses, ridge, sky, grass, framing, grain and black-and-white film look. No text, no logos, no other people.

### Final: composite (`scripts/art/round6b-composite.py`)

g1 also drew the coder and bench at 20–30 % of the frame height. The model draws the subject well and ignores the size, so `fog-f1` is a composite: the `fog-e1` plates (old figure box from `raw/fog-rm-*-a.png`), with the coder and bench from `raw/fog-g1-16x9-a.png` matted by difference, the laptop screen dimmed, scaled down (×0.36 / ×0.48) and seated on the crest. The grade adds `--filaments` (28 % softer) and `--depaint` (fine grain in the city band). See PICK.md, 6b.

## Grade (`scripts/art/round6-grade.py`)

Run on the pick only (the candidates on the sheet are raw, shown in greyscale). 16:9: Rec.709 luminance to R=G=B, black point 16, mid lift gamma 0.92, soft shoulder from 195 toward 230 (peak lands at 224), top fade x (0.12 + 0.88 smoothstep(0.24, 0.41, y)). 4:5 (`--light`, because its reference was already graded): black point 4, no mid lift, same shoulder, fade smoothstep(0.22, 0.40). Measurements: PICK.md.
