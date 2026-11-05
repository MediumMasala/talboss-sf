#!/usr/bin/env python3
"""Builds the round 6 job list (scripts/art/round6-jobs.json) and docs/team/art/round6/PROMPTS.md.

Round 6 brief: docs/team/HERO_DIRECTION.md, "The fog is thinking" (Steve, 5 Nov 2026). One direction.
Eight 16:9 takes at 4K from gemini-3-pro-image. The prompt is the doc's prompt, verbatim. Each take appends
one variation sentence that changes only what the art lane may vary: time of night, fog density and the
figure's placement inside the stated range (x 18-22 %, height ~10 %).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_JSON = os.path.join(ROOT, "scripts", "art", "round6-jobs.json")
OUT_MD = os.path.join(ROOT, "docs", "team", "art", "round6", "PROMPTS.md")

PROMPT = (
    "A 35mm film still from an independent drama, night in San Francisco. The camera is low on the dry grass at the top "
    "of a steep city hill, looking out across the city toward the long western ridge. The dark crest of the hill runs "
    "almost level across the bottom third of the frame. On the crest, about one fifth of the way in from the left edge "
    "and small (about one tenth of the frame height), a young person sits alone on the grass with their knees drawn up "
    "and arms around them, seen from behind and slightly to the side, in a plain hoodie; a closed laptop lies on the "
    "grass beside them. Their face is not visible. They are completely still, watching the fog. Below them the city "
    "fills the valley as a carpet of soft white lights: rows of small houses on steep streets, no tall buildings in "
    "view. Beyond the city, a thick river of fog pours over the dark ridge on the horizon and spills slowly down into "
    "the city, glowing from inside, lit by the city beneath it, luminous white and silver. Where the fog is nearest, "
    "its edge breaks into countless very fine glowing filaments, like mycelium or neurons, so delicate they are only "
    "noticed on a second look. On the ridge a tall three-pronged broadcast tower rises out of the fog as a dark "
    "silhouette. The ridge sits at about 42 % of the frame height. Above it the night sky is pure black and empty, with "
    "no stars and no moon. The fog's glow is the brightest thing in the image, just below the ridge in the centre. The "
    "lower centre of the frame is the dark grass of the hill, almost black, smooth and empty. The only light is the "
    "city and the glowing fog, with a faint rim of fog light on the person's shoulders and hair. Strictly black and "
    "white: deep blacks, silver greys, soft whites, no colour cast. 40mm lens, natural, quiet, intimate, a little "
    "melancholy and hopeful; very fine film grain, gentle halation around the brightest lights, no HDR, no glossy CGI "
    "look. Wide 16:9. No text, letters, signs, logos, bridges, skyscrapers or landmarks other than the broadcast tower; "
    "no other people, no glowing screen, no stars, no sci-fi, no holograms, no circuit patterns, no dots or particles, "
    "no lens flare."
)

# Re-roll clause (pass 2). Pass 1 (a-h) drew the person at 20-30 % of the frame height, at x 25-30 %, the ridge at
# ~33 % and, in six of eight, an open laptop. This restates the doc's own placement (small, x ~20 %, ridge 42 %,
# closed laptop) more forcefully; it adds nothing new to the scene.
SCALE = (
    " Scale and placement are critical: this is a wide shot and the person is far from the camera, about twenty metres "
    "away, so they are tiny in the frame, their whole seated body no more than one tenth of the frame height and very "
    "narrow; their head is just above the middle of the frame. The crest of the hill they sit on runs nearly level "
    "across the whole width at about two thirds of the way down the frame, with a wide band of dark, empty, out-of-focus "
    "grass in front of it filling the bottom third. The ridge and the fog are at 42 % of the frame height, not higher. "
    "The laptop is shut, lying flat on the grass, its lid closed."
)

# Pass 3 (q-x). Pass 2 still drew the person at 17-23 % of the frame height. The model ignores percentages, so this
# anchors the doc's "small" with relative sizes it can see in the frame (the tower, the houses, the frame width).
SCALE3 = (
    " Scale is the most important thing in this picture: the person is a tiny, distant figure, far smaller than you "
    "expect. Seated, they are shorter than the broadcast tower looks on the far ridge, and only about as tall as two "
    "of the small houses in the city below look from here. The frame is about forty times as wide as their shoulders. "
    "Huge empty space around them: the hill, the city and the fog dominate, the person is a small dark shape on the "
    "crest, about one fifth of the way in from the left, their head just above the middle of the frame. The crest "
    "runs level across the frame at about two thirds of the way down; the bottom third is a wide band of dark, empty "
    "grass. The fog-covered ridge is at 42 % of the frame height. The laptop is shut, lying flat on the grass. The "
    "image fills the frame edge to edge, with no border."
)

# Pass 4 (r1-r8). Three text passes put the person at x 0.27-0.34 and the ridge at ~0.30-0.33, so no take met the
# doc's layout. Pass 4 hands the best-lit pass-3/pass-2 takes back as reference images and asks for the doc's exact
# layout, the same way the doc builds the 4:5 ("Recompose this exact scene ..."), followed by the doc prompt verbatim.
RECOMPOSE16 = (
    "Recompose this exact scene, same kind of person, same fog, same tower, same light and film look, for a wide 16:9 "
    "frame with this exact layout: the camera has stepped back so the person is small and sits far to the left, one "
    "fifth of the way in from the left edge (well left of the centre third), their seated body about one tenth of the "
    "frame height, their head at 56 % of the frame height; the crest of the hill runs level across the frame at 66 %; "
    "the fog-covered ridge and the tower base are at 42 %; the top 35 % of the frame is pure black empty sky (only the "
    "slim dark tower may rise into it); the fog's glow is brightest just under the ridge in the centre; the lower "
    "centre third is dark, smooth, empty grass. The laptop is shut and lies flat. Fill the frame edge to edge, no "
    "border. "
)
RECOMPOSE_SEEDS = ["w", "w", "r", "r", "i", "i", "j", "l"]

# (take, time of night, fog density, figure x)
VARIANTS = [
    ("a", "late evening, the city still awake", "a thick, full river of fog", "about 20 %"),
    ("b", "just after midnight", "a dense, slow-moving bank of fog, generous and bright", "about 19 %"),
    ("c", "the small hours, the city quiet", "a lighter, thinner fog in soft veils", "about 21 %"),
    ("d", "late evening", "a towering, heavy wave of fog cresting the ridge", "about 18 %"),
    ("e", "just after midnight", "a medium fog, soft and even, glowing warmly white from within", "about 20 %"),
    ("f", "the small hours", "a thick fog that has already spilled halfway down into the city", "about 22 %"),
    ("g", "late evening", "a dense, luminous fog bank so bright it lights the whole valley gently", "about 20 %"),
    ("h", "just after midnight", "a thinner, wispy fog with the city lights glowing up through it", "about 19 %"),
]
VARIANTS3 = [(chr(ord(t) + 16), w, f, x) for t, w, f, x in VARIANTS]  # q..x
# Pass 2: the same eight variations, with the scale clause.
VARIANTS2 = [(chr(ord(t) + 8), w, f, x) for t, w, f, x in VARIANTS]  # i..p

jobs = []
for take, when, fog, x in VARIANTS:
    var = (
        f" Variation for this take: the time is {when}; the fog is {fog}; the person sits {x} of the way in from the "
        "left edge, about one tenth of the frame height."
    )
    jobs.append({"name": f"fog-{take}-16x9", "aspect": "16:9", "size": "4K", "prompt": PROMPT + var})
for take, when, fog, x in VARIANTS2:
    var = (
        f" Variation for this take: the time is {when}; the fog is {fog}; the person sits {x} of the way in from the "
        "left edge, about one tenth of the frame height."
    )
    jobs.append({"name": f"fog-{take}-16x9", "aspect": "16:9", "size": "4K", "prompt": PROMPT + var + SCALE})
for take, when, fog, x in VARIANTS3:
    var = (
        f" Variation for this take: the time is {when}; the fog is {fog}; the person sits {x} of the way in from the "
        "left edge."
    )
    jobs.append({"name": f"fog-{take}-16x9", "aspect": "16:9", "size": "4K", "prompt": PROMPT + var + SCALE3})

REF_PROMPT = (
    "Recompose this exact scene, same person, same fog, same tower, for a vertical 4:5 phone frame: ridge at 40 %, "
    "crest at 62 %, person at 24 % from the left, top 35 % pure black. The person stays the same small size relative to the city, their head at 52 % of the frame height. Keep the same 35mm black-and-white film look, "
    "the same grain and the same light: the glowing fog is the brightest thing, just under the ridge in the centre; "
    "the lower centre is dark, empty grass. The person stays small, seen from behind, face not visible, the closed "
    "laptop beside them. No text, logos, bridges, skyscrapers, stars, glowing screen, dots or particles."
)

for n, seed in enumerate(RECOMPOSE_SEEDS, 1):
    jobs.append({
        "name": f"fog-r{n}-16x9", "aspect": "16:9", "size": "4K",
        "ref": f"docs/team/art/round6/raw/fog-{seed}-16x9.png",
        "prompt": RECOMPOSE16 + PROMPT,
    })

# Pass 5 (e1-e2): r2 is the best frame but its laptop lid is up (the doc rejects an open laptop). Local edit only.
LAPTOP_EDIT = (
    "Edit this photograph. Change only one thing: the laptop on the grass beside the person is closed, its lid shut, "
    "lying flat on the grass as a thin dark slab. Keep everything else exactly the same: the same person in the same "
    "pose and place, the same hood, the same fog, filaments, tower, city lights, grass, framing, grain and black-and-white "
    "film look. No text, no glowing screen."
)
for n in (1, 2):
    jobs.append({
        "name": f"fog-e{n}-16x9", "aspect": "16:9", "size": "4K",
        "ref": "docs/team/art/round6/raw/fog-r2-16x9.png", "prompt": LAPTOP_EDIT,
    })

# 4:5 from the pick (graded 16:9 as the reference image), two takes.
PICK = "e1"
for take in ("a", "b"):
    jobs.append({
        "name": f"fog-{PICK}-4x5-{take}", "aspect": "4:5", "size": "4K",
        "ref": f"docs/team/art/round6/fog-{PICK}-16x9.png", "prompt": REF_PROMPT,
    })

# Round 6b (founder, 5 Nov: "Why is a depressed guy looking over a hill?"): the figure is out. Local edit of the
# pick (raw plates, then the same grade), two takes per crop.
REMOVE_EDIT = (
    "Edit this photograph. Remove the seated person and the laptop on the grass completely. Where they were, the dark "
    "grass of the hill crest simply continues, and behind it the lit city continues exactly as it would, with no trace, "
    "no shadow, no outline and nothing put in their place: no other person, no object, no rock, no bench. Keep "
    "everything else exactly the same, pixel for pixel: the same fog, the same glowing filaments, the same tower, the "
    "same city lights and houses, the same ridge, sky, grass, framing, grain and black-and-white film look. No text."
)
for crop, aspect, src in (("16x9", "16:9", "fog-e1-16x9.png"), ("4x5", "4:5", "fog-e1-4x5-a.png")):
    for take in ("a", "b"):
        jobs.append({
            "name": f"fog-rm-{crop}-{take}", "aspect": aspect, "size": "4K",
            "ref": f"docs/team/art/round6/raw/{src}", "prompt": REMOVE_EDIT,
        })

# Round 6b, final instruction (founder, overriding the removal): "show them as a coder with a MacBook (subtly
# visible) coding on a bench and overlooking SF". Local edit of the raw pick plates, three takes per crop.
CODER_EDIT = (
    "Edit this photograph. Replace only the hunched, hooded seated person and the laptop on the grass with this: a "
    "young person sitting upright and engaged on a simple, plain wooden park bench on the crest of the hill, in the "
    "same place and at the same small size (no taller than the original figure), seen from behind and slightly "
    "three-quarter from the back, so their face is not visible. The bench faces away from the camera, toward the city "
    "and the fog. Their hood is down; short hair, rim-lit by the glow of the fog. A slim plain silver laptop is open on "
    "their lap and they are typing, absorbed, the posture of someone building something: shoulders open, back "
    "straight, leaning slightly toward the screen. The screen is dim and seen from behind: only a very faint, soft "
    "glow on their hands and the edge of their cheek, much darker than the fog, no visible screen content, no logo on "
    "the lid. Keep everything else exactly the same: the same fog, the same glowing filaments, the same tower, the "
    "same city lights and houses, the same ridge, sky, grass, framing, grain and black-and-white film look. No text, "
    "no logos, no other people."
)
for crop, aspect, src in (("16x9", "16:9", "fog-e1-16x9.png"), ("4x5", "4:5", "fog-e1-4x5-a.png")):
    for take in ("a", "b", "c"):
        jobs.append({
            "name": f"fog-c1-{crop}-{take}", "aspect": aspect, "size": "4K",
            "ref": f"docs/team/art/round6/raw/{src}", "prompt": CODER_EDIT,
        })

# Round 6b pass 2 (g1): the c1 edits drew the coder at 20-26 % of the frame height and moved them right. So the
# reference is the clean plate (rm-*-a, person removed) with a flat grey placement box at the exact size and place
# (16:9: x 0.165-0.265, y 0.585-0.700; 4:5: x 0.08-0.255, y 0.587-0.700), built by hand as raw/guide-*.png.
PLACE_EDIT = (
    "Edit this photograph. Replace the flat grey rectangle with a young person coding on a simple, plain wooden park "
    "bench, drawn to fill exactly the rectangle's area and no more: the bench's legs stand on the grass of the crest at "
    "the rectangle's bottom edge and the top of the person's head is at the rectangle's top edge. Seen from behind and "
    "slightly three-quarter from the back, so the face is not visible; the bench faces away from the camera, toward the "
    "city and the fog. Hood down, short hair rim-lit by the fog's glow. They sit upright and engaged, shoulders open, "
    "leaning slightly toward a slim plain silver laptop open on their lap, typing: someone building something. The "
    "screen is seen from behind; only a very faint soft glow touches their hands and the edge of their cheek, much "
    "darker than the fog; no screen content, no logo. Remove the grey rectangle completely: the lit city shows "
    "around the person and through the gaps of the bench. Keep everything else exactly the same: the same fog, "
    "filaments, tower, city lights and houses, ridge, sky, grass, framing, grain and black-and-white film look. No "
    "text, no logos, no other people."
)
for crop, aspect in (("16x9", "16:9"), ("4x5", "4:5")):
    for take in ("a", "b", "c"):
        jobs.append({
            "name": f"fog-g1-{crop}-{take}", "aspect": aspect, "size": "4K",
            "ref": f"docs/team/art/round6/raw/guide-{crop}.png", "prompt": PLACE_EDIT,
        })

# Round 6c (founder: "LOVE THE HERO CREATIVE... any way to make the city look more like SF?"). Edit only the city
# on the clean plates (raw/fog-clean-*.png, no person, so the model cannot move them); the coder is composited back
# afterwards by round6b-composite.py --plates ... --tag g1.
SF_EDIT = (
    "Edit this photograph. Change only the city in the valley below the fog so that anyone from San Francisco "
    "recognises it at a glance, as the view from Twin Peaks over Noe Valley: steep streets laid out in a straight grid, "
    "running downhill toward the bay, lit by soft streetlights; rows of narrow bay-windowed Victorian and Edwardian "
    "row houses stepping down the hills, packed side by side; one long straight street with a line of lights running "
    "down it like a cable-car line. Far to the right, deep in the fog, a faint, small, soft, low downtown silhouette "
    "with one tall slim tower and one small pyramid spire, so muted the eye finds it last. Beyond the city, the dark "
    "bay with a faint thin line of East Bay lights on the far shore. Keep the city exactly as bright as it is now and "
    "keep it in the same place in the frame. Keep everything else exactly the same: the same glowing fog pouring over "
    "the ridge and its filaments, the same Sutro tower, the same ridge, the same black sky, the same dark grass "
    "and the crest line in the foreground, the same framing, grain and black-and-white film look. No people, no "
    "bridges, no text, no signs, no logos."
)
for crop, aspect in (("16x9", "16:9"), ("4x5", "4:5")):
    for take in ("a", "b", "c"):
        jobs.append({
            "name": f"fog-sf-{crop}-{take}", "aspect": aspect, "size": "4K",
            "ref": f"docs/team/art/round6/raw/fog-clean-{crop}.png", "prompt": SF_EDIT,
        })

with open(OUT_JSON, "w") as f:
    json.dump(jobs, f, indent=2)


def write_md(pick_ref=None):
    md = [
        "# Round 6 prompts: \"The fog is thinking\"",
        "",
        "Direction: `docs/team/HERO_DIRECTION.md` (Steve, 5 Nov 2026). Model `gemini-3-pro-image`, `imageConfig.imageSize: \"4K\"`, "
        "via `scripts/art/gen.mjs`. Jobs built by `scripts/art/round6-jobs.py`.",
        "",
        "Every 16:9 take = the doc's prompt, verbatim, plus one variation sentence (time of night, fog density, figure x within 18–22 %). "
        "Nothing else changes.",
        "",
        "## Base prompt (16:9, verbatim from HERO_DIRECTION.md)",
        "",
        PROMPT,
        "",
        "## Variations",
        "",
        "| take | time of night | fog | figure x |",
        "|---|---|---|---|",
    ]
    for take, when, fog, x in VARIANTS:
        md.append(f"| `fog-{take}-16x9` | {when} | {fog} | {x} |")
    md += [
        "",
        "## Pass 2 (re-roll, takes i–p)",
        "",
        "Pass 1 failed the doc's placement on every take: the person was 20–30 % of the frame height (reject above 14 %), "
        "sat at x 25–30 %, the ridge came in at ~33 % instead of 42 %, and six of eight showed an open laptop. Pass 2 runs "
        "the same eight variations (i = a, j = b, … p = h) with one extra sentence that restates the doc's own placement:",
        "",
        SCALE.strip(),
        "",
        "## Pass 3 (re-roll, takes q–x)",
        "",
        "Pass 2 still drew the person at 17–23 % of the frame height, and three takes (n, o, p) came back with black "
        "borders baked in. Pass 3 runs the same eight variations (q = a … x = h) and swaps the pass-2 sentence for "
        "relative size anchors the model can see in the frame:",
        "",
        SCALE3.strip(),
        "",
        "## Pass 4 (recompose from a reference, takes r1–r8)",
        "",
        "Three text passes never met the layout: the person sat at x 0.27–0.34 (inside or touching the copy column) and the "
        "ridge at ~0.30–0.33. Pass 4 hands the best-lit earlier takes back as the reference image, the same way the doc "
        "builds the 4:5, with this instruction in front of the doc prompt (verbatim):",
        "",
        RECOMPOSE16.strip(),
        "",
        "Seeds: " + ", ".join(f"r{n} ← fog-{s}" for n, s in enumerate(RECOMPOSE_SEEDS, 1)) + ".",
        "",
        "## Pass 5 (local edit of r2, takes e1–e2)",
        "",
        "r2 met the layout but its laptop lid was up. Reference = `raw/fog-r2-16x9.png`; prompt:",
        "",
        LAPTOP_EDIT,
        "",
    ]
    md += [
        "",
        "## 4:5 (reference image = the chosen 16:9, graded: `fog-e1-16x9.png`; takes `fog-e1-4x5-a`, `-b`)",
        "",
        REF_PROMPT,
        "",
        "## Round 6b, first instruction: figure removed (takes rm-16x9-a/b, rm-4x5-a/b)",
        "",
        "Founder verdict on fog-e1: \"Why is a depressed guy looking over a hill?\" The person is out. Reference = the raw "
        "pick plates (`raw/fog-e1-16x9.png`, `raw/fog-e1-4x5-a.png`), then the same grade. Prompt:",
        "",
        REMOVE_EDIT,
        "",
        "Superseded before review by the founder's next instruction (below); the removal takes stay in `raw/fog-rm-*`.",
        "",
        "## Round 6b: coder on a bench (takes c1-16x9-a/b/c, c1-4x5-a/b/c → `fog-f1-*`)",
        "",
        "Founder: \"show them as a coder with a MacBook (subtly visible) coding on a bench and overlooking SF\". Reference = the "
        "raw pick plates. Prompt:",
        "",
        CODER_EDIT,
        "",
        "### Pass 2 (g1): placement box",
        "",
        "The c1 edits drew the coder at 20–26 % of the frame height and moved them right, toward the copy column. Pass 2 "
        "edits the clean plate (`raw/fog-rm-*-a.png`) with a flat grey placement box painted at the exact size and place "
        "(`raw/guide-16x9.png`: x 0.165–0.265, y 0.585–0.700; `raw/guide-4x5.png`: x 0.08–0.255, y 0.587–0.700). Prompt:",
        "",
        PLACE_EDIT,
        "",
        "### Final: composite (`scripts/art/round6b-composite.py`)",
        "",
        "g1 also drew the coder and bench at 20–30 % of the frame height. The model draws the subject well and ignores the "
        "size, so `fog-f1` is a composite: the `fog-e1` plates (old figure box from `raw/fog-rm-*-a.png`), with the coder "
        "and bench from `raw/fog-g1-16x9-a.png` matted by difference, the laptop screen dimmed, scaled down (×0.36 / ×0.48) "
        "and seated on the crest. The grade adds `--filaments` (28 % softer) and `--depaint` (fine grain in the city band). "
        "See PICK.md, 6b.",
        "",
        "## Round 6c: more SF (takes sf-16x9-a/b/c, sf-4x5-a/b/c → `fog-g1-*`)",
        "",
        "Founder: \"LOVE THE HERO CREATIVE... any way to make the city look more like SF?\" Reference = the clean plates "
        "(`raw/fog-clean-*.png`: the 6b plate without the coder), so the model cannot move the person; the same coder is "
        "composited back by `round6b-composite.py --plates ... --tag g1`, then the 6b grade. Prompt:",
        "",
        SF_EDIT,
        "",
        "Picks: `fog-sf-16x9-a`, `fog-sf-4x5-b`. Grade as 6b plus `--veil` on the downtown (16:9 box 0.78,0.33,0.97,0.50; "
        "4:5 box 0.78,0.40,0.99,0.50) so it stays small and soft. See PICK.md, 6c.",
        "",
        "## Grade (`scripts/art/round6-grade.py`)",
        "",
        "Run on the pick only (the candidates on the sheet are raw, shown in greyscale). 16:9: Rec.709 luminance to R=G=B, "
        "black point 16, mid lift gamma 0.92, soft shoulder from 195 toward 230 (peak lands at 224), top fade "
        "x (0.12 + 0.88 smoothstep(0.24, 0.41, y)). 4:5 (`--light`, because its reference was already graded): black point 4, "
        "no mid lift, same shoulder, fade smoothstep(0.22, 0.40). Measurements: PICK.md.",
        "",
    ]
    with open(OUT_MD, "w") as f:
        f.write("\n".join(md))


write_md()
print(len(jobs), "jobs ->", OUT_JSON)
