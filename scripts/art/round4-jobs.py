#!/usr/bin/env python3
"""Builds the round 4 job list (scripts/art/round4-jobs.json) and docs/team/art/round4/PROMPTS.md.

Round 4 brief (Steve v4.1 round 1, item 1, 5 Nov 2026): the hero city must be San Francisco.
Same motif as round 3 `particle-horizon-a` (silver particle field running to a glowing wireframe
skyline at dawn, black sky in the top 40 % for the wordmark, monochrome, no text), with an
unmistakable SF skyline: Transamerica Pyramid, Salesforce Tower, Bay Bridge towers and cables,
the low hills behind. Three takes, 16:9 and 4:5 each.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_JSON = os.path.join(ROOT, "scripts", "art", "round4-jobs.json")
OUT_MD = os.path.join(ROOT, "docs", "team", "art", "round4", "PROMPTS.md")

# Round 3 shared base, unchanged.
BASE = (
    "Strictly monochrome: only pure black, pure white and silver greys, no colour cast at all. "
    "Light is the only colour. The mood is optimistic, bright, expansive and calm, like the first "
    "morning of something big: a world of opportunity ahead. Shot like a premium Silicon Valley "
    "brand campaign (think high-end product photography and architectural photography for an "
    "AI company launch): pristine, expensive, minimal, precise, crisp edges, soft silver highlights, "
    "high dynamic range, very fine subtle grain. Absolutely no people, no hands, no text, no letters, "
    "no numbers, no logos, no watermark, no signage, no brains, no circuit boards, no robots, no glowing "
    "neural networks, no furniture, no empty rooms."
)

# Round 3 dark grade, unchanged.
GRADE = (
    "Grade for a black web page: the outer edges and the top of the frame fall off smoothly to pure "
    "black so white type can sit on it, while the light itself is luminous and hopeful, never gloomy."
)

COMPOSE = {
    "16:9": (
        "Wide 16:9 composition. The top 40 % of the frame is clean, empty, pure black sky for a large logo; "
        "the skyline stands on the horizon at about 57 % of the frame height, centred, spanning the middle "
        "two thirds of the width; the particle field fills the bottom of the frame."
    ),
    "4:5": (
        "Vertical 4:5 composition for a phone screen. The top 40 % of the frame is clean, empty, pure black sky "
        "for a logo; the skyline stands on the horizon at about 58 % of the frame height and spans almost the "
        "full width; the particle field fills the bottom of the frame."
    ),
}

# What makes it San Francisco (shared by all takes).
SF = (
    "The skyline is unmistakably San Francisco, seen from the water to the east, built as glowing silver "
    "wireframe lines and fine points of light: the Transamerica Pyramid, a slender sharply pointed four-sided "
    "white pyramid with a needle tip and two small shoulders near the top, the most recognisable silhouette in "
    "the frame; the Salesforce Tower, clearly the tallest building, a smooth slim obelisk with softly rounded "
    "corners whose top gently tapers to a rounded crown; a dense cluster of shorter flat-topped modern downtown "
    "towers around them; the San Francisco-Oakland Bay Bridge, its tall suspension towers with long graceful "
    "draping main cables and a fine row of lights along the deck, running toward the city; and low, soft, rounded "
    "hills rising behind the city, with a slim three-pronged radio mast on the highest hill. Not New York: no "
    "Art Deco spires, no Empire State or Chrysler shapes, no Golden Gate Bridge."
)

TAKES = {
    "a": (
        "A vast plane of millions of fine silver points of light receding in perspective toward the horizon, like a "
        "luminous digital field, rising at the far edge into a city skyline made entirely of points of light, with a "
        "bright silver glow of dawn behind it. " + SF + " The Bay Bridge enters from the right and its cables lead the "
        "eye to the city; the pyramid stands left of centre and the Salesforce Tower right of centre. Precise, "
        "generative, data as light, elegant and hopeful."
    ),
    "b": (
        "Seen from just above a vast luminous field of millions of fine silver points of light that recede in "
        "perspective to the horizon, a glowing wireframe San Francisco skyline rises at dawn, a bright silver sun-glow "
        "blooming directly behind the downtown towers. " + SF + " Closer and bolder: the Transamerica Pyramid and the "
        "Salesforce Tower stand side by side at the centre, crisp and large, and two Bay Bridge towers with their "
        "cables trail away to the right. Precise, generative, data as light, elegant and hopeful."
    ),
    "c": (
        "A wide panorama: an endless field of fine silver points of light runs in perspective to a flat horizon, where a "
        "delicate wireframe San Francisco skyline of glowing points and lines stands against a soft silver dawn. "
        + SF + " The rounded hills are more visible behind the city, layered in soft silver haze, and the Bay Bridge "
        "spans from the right edge into the city. Precise, generative, data as light, elegant, calm and hopeful."
    ),
}

# Re-roll 1 (5 Nov): v1 of sf-horizon-a-16x9 put the Salesforce Tower and the pyramid tip behind the wordmark at 1440
# (its skyline climbed to 30 % of the frame). The shipped take frames an empty centre with the two landmarks instead.
REROLL = {
    "sf-horizon-a-16x9": (
        "Wide 16:9 composition. A large logo will sit in the top centre of the frame, so the centre of the skyline is kept low: "
        "directly below the top centre (between 40 % and 60 % of the width) there are only short buildings, with the dawn glow rising "
        "between them. The Transamerica Pyramid stands at about 30 % of the width and the Salesforce Tower at about 68 % of the width, "
        "framing the empty centre like two gateposts. The horizon sits at about 58 % of the frame height; the top 40 % is clean black sky; "
        "the particle field fills the bottom of the frame.",
        "The Bay Bridge enters from the right and its cables lead the eye to the city; the pyramid stands left of centre and the "
        "Salesforce Tower right of centre.",
        "The Bay Bridge enters from the right edge and its cables lead the eye to the city.",
    ),
}

jobs, md = [], [
    "# Round 4 prompts: San Francisco horizon (original, generated)",
    "",
    "Brief: Steve v4.1 round 1, item 1 (5 Nov 2026). The round 3 hero `particle-horizon-a` read as Manhattan under the",
    "line \"Now in San Francisco\". Same motif, an unmistakable SF skyline.",
    "",
    "Model: `gemini-3.1-flash-image` via `scripts/art/gen.mjs`. Built by `scripts/art/round4-jobs.py`.",
    "Every prompt = take subject (with the shared SF description) + composition + round 3 dark grade + round 3 shared base.",
    "",
    "Shared SF description:",
    "",
    "> " + SF,
    "",
    "Grade (round 3 dark): " + GRADE,
    "",
    "Shared base (round 3): " + BASE,
    "",
]
for take, subject in TAKES.items():
    md += [f"## sf-horizon-{take}", ""]
    for aspect in ("16:9", "4:5"):
        name = f"sf-horizon-{take}-{aspect.replace(':', 'x')}"
        prompt = f"{subject} {COMPOSE[aspect]} {GRADE} {BASE}"
        if name in REROLL:
            compose, old, new = REROLL[name]
            prompt = f"{subject.replace(old, new)} {compose} {GRADE} {BASE}"
        jobs.append({"name": name, "aspect": aspect, "grade": "dark", "prompt": prompt})
        md += [f"**`{name}.png`** ({aspect})", "", "```text", prompt, "```", ""]

md += [
    "## Re-rolls (5 Nov)",
    "",
    "- `sf-horizon-a-16x9`: v1 (kept outside the repo) put the Salesforce Tower and the pyramid tip behind the wordmark in the 1440 crop;",
    "  the model would not lower the skyline when asked, so the shipped prompt (above) places the pyramid and the Salesforce Tower either",
    "  side of an empty centre. 4 renders; the first was picked.",
    "",
    "## Pick",
    "",
    "**`sf-horizon-a`** (both crops) is the hero. The Transamerica Pyramid stands clear against the dawn glow, so it reads even",
    "at 220 px wide; the Salesforce Tower, Sutro Tower on the hills and the Bay Bridge towers and cables finish the city. In the 16:9",
    "the pyramid (36 % of the width) and the Salesforce Tower (63 %) flank the wordmark; the horizon sits at 59 %, so the sub and CTA",
    "land on the dark particle field. Take b has the boldest pyramid but its 16:9 horizon sits at 67 %, under the sub line at 1440.",
    "Take c's 4:5 drops the skyline to 73 % and floods the sky grey.",
    "",
    "## Post",
    "",
    "- All neutralised to true greyscale (R=G=B) after generation (max chroma before: 7 to 9 of 255).",
    "- `og-a-1200x630.jpg`: `sf-horizon-a-16x9` at a 1.25x push-in (1500 wide), horizon at 64 % (the round 3 og-b recipe).",
    "  `scripts/og.mjs` composites the wordmark into `app/opengraph-image.jpg`; the two landmarks frame it.",
    "- `scripts/art.mjs` now takes the hero from round 4 (`sf-horizon-a-*`); Done (`horizon-dawn-b-4x5`) and the deal orb",
    "  (`chrome-orb-b-4x5`) are unchanged from round 3.",
    "",
]
os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
with open(OUT_JSON, "w") as f:
    json.dump(jobs, f, indent=1)
with open(OUT_MD, "w") as f:
    f.write("\n".join(md))
print(len(jobs), "jobs")
