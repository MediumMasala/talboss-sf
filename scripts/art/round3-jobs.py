#!/usr/bin/env python3
"""Builds the round 3 job list (scripts/art/round3-jobs.json) and docs/team/art/round3/PROMPTS.md.

Round 3 brief (founder, 4 Nov 2026): positive, bright, "the world of opportunities ahead",
clean expensive Western-startup imagery. Monochrome: black, white, silver; light is the colour.
No people, no text, no logos, no AI-brain clichés.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_JSON = os.path.join(ROOT, "scripts", "art", "round3-jobs.json")
OUT_MD = os.path.join(ROOT, "docs", "team", "art", "round3", "PROMPTS.md")

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

GRADE = {
    "dark": (
        "Grade for a black web page: the outer edges and the top of the frame fall off smoothly to pure "
        "black so white type can sit on it, while the light itself is luminous and hopeful, never gloomy."
    ),
    "white": (
        "Grade for a white web page: high-key, the outer edges fade to pure white, shadows are soft pale "
        "silver-grey, airy and bright, the whole image feels like morning light on paper."
    ),
}

COMPOSE = {
    "16:9": "Wide 16:9 composition; keep generous calm negative space in the upper-middle of the frame for a large wordmark.",
    "4:5": "Vertical 4:5 composition for a phone screen; the subject sits in the lower half, with open calm negative space in the upper third.",
}

# motif -> take -> (grade, subject prompt)
MOTIFS = {
    "horizon-dawn": {
        "a": ("dark",
              "Above a vast sea of low cloud at first light, seen from high altitude. A brilliant silver-white "
              "sun is just cresting a perfectly flat horizon, laying a wide luminous band of light across the "
              "soft rolling cloud tops. The sky rises from bright silver at the horizon to deep black at the top. "
              "Endless, open, the feeling of everything ahead."),
        "b": ("white",
              "A high-key dawn over an endless sea of soft white cloud, the horizon a thin bright line far away, "
              "the sun a gentle white bloom just above it, pale silver sky, delicate silver shading in the cloud "
              "folds. Bright, weightless, serene, full of possibility. No vignette, no border, no frame; the corners stay pure white."),
    },
    "glass-tower-light": {
        "a": ("dark",
              "Looking up the facade of a sleek modern glass curtain-wall tower at sunrise. Rows of precise vertical "
              "glass fins catch the first sun and split it into long razor-thin silver highlights and soft glowing "
              "reflections of the sky, geometric and rhythmic, rising into a dark sky. Architectural, precise, ascendant."),
        "b": ("white",
              "Inside a tall bright atrium of white stone and glass. Morning sun streams through a vast glass facade "
              "with slender mullions, casting long parallel bars of light and soft silver shadows across a pale polished "
              "floor and wall. Clean, generous, luminous, like the lobby of the future."),
    },
    "chrome-orb": {
        "a": ("white",
              "A single perfect sphere of flawless clear optical glass resting on a seamless pure white surface. Soft "
              "daylight passes through it, focusing into a bright crisp caustic of light and a delicate soft shadow on "
              "the white floor; the sphere refracts an inverted bright horizon inside it. Studio product photography, "
              "immaculate, precious."),
        "b": ("white",
              "A single mirror-polished liquid chrome sphere floating just above a seamless white surface, reflecting a "
              "soft bright sky and a clean horizon line across its curve, a faint soft shadow beneath. Silver, white and "
              "pearl tones only. Studio product photography, immaculate, weightless."),
    },
    "aperture": {
        "a": ("dark",
              "Inside a vast curved concrete dome in a minimalist museum, a large perfectly round oculus open to a bright morning "
              "sky. Sunlight enters at a low diagonal angle and lays a crisp bright ellipse of light across the smooth curved "
              "inner wall of the dome, the concrete glowing silver around it and falling away into velvety black at the edges. "
              "Architectural and real, not a spotlight, not a vertical beam. Quiet, uplifting, generous."),
        "b": ("white",
              "A clean white minimalist architectural space with a perfect circular opening framing a bright pale open "
              "sky. Smooth white plaster curves gently toward the aperture, lit softly, with the faintest silver gradient. "
              "Calm, bright, open, like looking up into what comes next."),
    },
    "particle-horizon": {
        "a": ("dark",
              "A vast plane of millions of fine silver points of light receding in perspective toward the horizon, like a "
              "luminous digital field, rising at the far edge into a soft skyline of tall city towers made entirely of "
              "points of light, with a bright silver glow of dawn behind the skyline. Precise, generative, data as light, "
              "elegant and hopeful."),
        "b": ("white",
              "On a pure white field, millions of fine graphite and silver points form a gently undulating plane receding "
              "to the horizon and rising into a delicate skyline of towers made of dots, with a soft bright light glowing "
              "behind it. Minimal, generative, airy, refined, like a scientific illustration of the future. Full bleed: no border, no frame, no inset card, no vignette; the corners stay pure white."),
    },
    "silk-light": {
        "a": ("white",
              "Folds of liquid silver satin cloth gently draped and flowing across a pure white surface, soft morning light "
              "raking across the folds so the ridges shine bright silver and the valleys fall into soft pale grey. "
              "Luxurious, calm, premium, abstract."),
        "b": ("dark",
              "A single long ribbon of liquid silver silk sweeping in a slow graceful arc through a black void, its crest "
              "catching a bright line of light like a horizon at dawn, soft reflections along its folds. Luxurious, abstract, "
              "luminous, rising."),
    },
}

jobs, md = [], [
    "# Round 3 prompts (original, generated)",
    "",
    "Model: `gemini-3.1-flash-image` via `scripts/art/gen.mjs` (OpenAI key still 401 on 4 Nov; not used).",
    "Every prompt = subject + composition + grade + shared base. Shared base:",
    "",
    "> " + BASE,
    "",
    "Grades:",
    "",
    "- **dark**: " + GRADE["dark"],
    "- **white**: " + GRADE["white"],
    "",
    "Compositions:",
    "",
    "- **16:9**: " + COMPOSE["16:9"],
    "- **4:5**: " + COMPOSE["4:5"],
    "",
]
for motif, takes in MOTIFS.items():
    md.append(f"## {motif}")
    md.append("")
    for take, (grade, subject) in takes.items():
        md.append(f"### {motif}-{take} (grade: {grade})")
        md.append("")
        md.append(subject)
        md.append("")
        for aspect in ("16:9", "4:5"):
            name = f"{motif}-{take}-{aspect.replace(':', 'x')}"
            prompt = f"{subject} {COMPOSE[aspect]} {GRADE[grade]} {BASE}"
            jobs.append({"name": name, "aspect": aspect, "grade": grade, "prompt": prompt})
            md.append(f"**`{name}.png`** ({aspect}, {grade} grade)")
            md.append("")
            md.append("```text")
            md.append(prompt)
            md.append("```")
            md.append("")
        md.append("")

with open(OUT_JSON, "w") as f:
    json.dump(jobs, f, indent=1)
md += [
    "## Re-rolls (4 Nov)",
    "",
    "- `aperture-a-*`: v1 read as a sci-fi beam from above; subject rewritten to a concrete dome oculus with a low diagonal sun ellipse (prompt above is the shipped one).",
    "- `horizon-dawn-b-*`: v1 4:5 had grey vignette corners; added 'No vignette, no border, no frame; the corners stay pure white.'",
    "- `particle-horizon-b-*`: v1 4:5 had an inset border; added 'Full bleed: no border, no frame, no inset card, no vignette'.",
    "",
    "## Post",
    "",
    "- All 24 neutralised to true greyscale (R=G=B) after generation.",
    "- `og-a-1200x630.jpg`: `particle-horizon-a-16x9` scaled to 1200 wide, centre-cropped to 630.",
    "- `og-b-1200x630.jpg`: same frame, 1.25x push-in, horizon at ~64% height.",
    "",
]
with open(OUT_MD, "w") as f:
    f.write("\n".join(md))
print(len(jobs), "jobs")
