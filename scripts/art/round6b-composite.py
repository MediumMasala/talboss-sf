#!/usr/bin/env python3
"""Round 6b: the coder on a bench, composited into the fog-e1 plates at the doc's size and place.

Why a composite: every reference-image edit with gemini-3-pro-image (c1, and g1 with a painted placement box) drew
the coder and bench at 20-30 % of the frame height and re-rendered the whole scene a little. The model draws the
subject well and ignores the size. So:
  1. Clean plate: the raw fog-e1 plate, with only the old figure's box (feathered) replaced by the matching pixels of
     the figure-removed edit (raw/fog-rm-*-a.png). Everywhere else is the fog-e1 plate, pixel for pixel.
  2. Subject: the coder + bench from raw/fog-g1-16x9-a.png, matted by its difference from the clean plate it was
     edited from (raw/fog-rm-16x9-a.png): dark subject on the lit city keys cleanly; the city through the bench gaps
     stays transparent. The laptop screen is dimmed to a faint glow so it never competes with the fog.
  3. The subject is scaled DOWN (never up) to the target height and composited with premultiplied alpha, its base on
     the crest. The same subject goes into both crops (same person).
Output: raw/fog-f1-16x9-comp.png, raw/fog-f1-4x5-comp.png (ungraded); then round6-grade.py grades them.
Also writes the clean plates raw/fog-clean-{16x9,4x5}.png. Round 6c: --plates 16x9=<raw>,4x5=<raw> --tag g1 seats the
same coder, at the same place and size, on an SF-city edit of the clean plate.

usage: python3 scripts/art/round6b-composite.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, "docs", "team", "art", "round6", "raw")
LUM = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)


def load(name):
    return np.asarray(Image.open(os.path.join(RAW, name)).convert("RGB")).astype(np.float32)


def box_mask(H, W, box, feather):
    m = np.zeros((H, W), np.float32)
    m[int(box[1] * H): int(box[3] * H), int(box[0] * W): int(box[2] * W)] = 1
    return nd.gaussian_filter(m, feather)


# ---- subject (from the g1 edit, matted against its clean plate) ----
g = load("fog-g1-16x9-a.png")
r = load("fog-rm-16x9-a.png")
H, W = g.shape[:2]
SB = (0.13, 0.32, 0.52, 0.82)                       # search box
x0, y0, x1, y1 = int(SB[0] * W), int(SB[1] * H), int(SB[2] * W), int(SB[3] * H)
gl, rl = g[y0:y1, x0:x1] @ LUM, r[y0:y1, x0:x1] @ LUM
d = nd.gaussian_filter(np.abs(gl - rl), 3)
soft = np.clip((d - 30) / 40, 0, 1)
lab, n = nd.label(soft > 0.5)
sizes = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
core = nd.binary_fill_holes(lab == (np.argmax(sizes) + 1))           # the person + bench, holes (hair, screen) filled
# The head sits on the dark ridge in the source, so only its rim keys; fill each row of the head between its rim edges.
cy = np.nonzero(core.any(1))[0]
rows = np.arange(cy.min(), int(0.507 * H) - y0)  # down to just above the laptop's top edge (source y 0.512)
spans = {yy: np.nonzero(core[yy])[0] for yy in rows}
# The neck (source y 0.453-0.461) keys only at its far rim: treat those rows as missing too.
neck = (int(0.453 * H) - y0, int(0.461 * H) - y0)
have = np.array([yy for yy in rows if len(spans[yy]) > 1 and not (neck[0] <= yy <= neck[1])])
lefts = np.interp(rows, have, [spans[yy].min() for yy in have])     # rows with no keyed pixel (the dark neck on
rights = np.interp(rows, have, [spans[yy].max() for yy in have])    # the dark ridge) take the neighbours' span
for yy, l, rr in zip(rows, lefts, rights):
    core[yy, int(l): int(rr) + 1] = True
near = nd.binary_dilation(core, iterations=6)
alpha = np.where(core, 1.0, np.where(near, soft, 0.0)).astype(np.float32)
alpha = nd.gaussian_filter(alpha, 1.2)
ys, xs = np.nonzero(alpha > 0.02)
sy0, sy1, sx0, sx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
subj = g[y0:y1, x0:x1][sy0:sy1, sx0:sx1].copy()
a = alpha[sy0:sy1, sx0:sx1]
# Dim the laptop screen (source x 0.350-0.410, y 0.505-0.590) to a faint glow, much darker than the fog.
lx0, lx1 = int(0.350 * W) - x0 - sx0, int(0.410 * W) - x0 - sx0
ly0, ly1 = int(0.505 * H) - y0 - sy0, int(0.590 * H) - y0 - sy0
scr = subj[ly0:ly1, lx0:lx1]
L = scr @ LUM
k = np.where(L > 70, (70 + (L - 70) * 0.30) / np.maximum(L, 1), 1.0)[..., None]
subj[ly0:ly1, lx0:lx1] = scr * k
src_h = sy1 - sy0
person_rel = (0.310 * W - x0 - sx0) / (sx1 - sx0)  # where the person's body sits across the bench
print(f"subject {sx1 - sx0}x{src_h} px, person at {person_rel:.2f} of the bench width")


def place(plate, target_h, person_x, base_y):
    Hp, Wp = plate.shape[:2]
    s = target_h / src_h
    assert s < 1, "never upscale the subject"
    tw, th = int(round((sx1 - sx0) * s)), int(round(src_h * s))
    pre = Image.fromarray(np.clip(subj * a[..., None], 0, 255).astype(np.uint8)).resize((tw, th), Image.LANCZOS)
    al = Image.fromarray((a * 255).astype(np.uint8)).resize((tw, th), Image.LANCZOS)
    pre = np.asarray(pre).astype(np.float32)
    al = np.asarray(al).astype(np.float32)[..., None] / 255
    left = int(round(person_x * Wp - person_rel * tw))
    top = int(round(base_y * Hp)) - th
    reg = plate[top: top + th, left: left + tw]
    plate[top: top + th, left: left + tw] = pre + reg * (1 - al)
    return (left / Wp, (left + tw) / Wp, top / Hp, (top + th) / Hp)


# usage: round6b-composite.py [--plates 16x9=<raw name>,4x5=<raw name>] [--tag f1]
import sys
PLATES = dict(kv.split("=") for kv in sys.argv[sys.argv.index("--plates") + 1].split(",")) if "--plates" in sys.argv else {}
TAG = sys.argv[sys.argv.index("--tag") + 1] if "--tag" in sys.argv else "f1"

for crop, e1, rm, oldbox, target_h_frac, person_x, base_y in (
    ("16x9", "fog-e1-16x9.png", "fog-rm-16x9-a.png", (0.18, 0.55, 0.30, 0.73), 0.115, 0.205, 0.700),
    ("4x5", "fog-e1-4x5-a.png", "fog-rm-4x5-a.png", (0.07, 0.55, 0.30, 0.73), 0.102, 0.240, 0.700),
):
    P, Rm = load(e1), load(rm)
    Hp, Wp = P.shape[:2]
    m = box_mask(Hp, Wp, oldbox, 30)[..., None]
    plate = P * (1 - m) + Rm * m
    Image.fromarray(np.clip(np.round(plate), 0, 255).astype(np.uint8)).save(
        os.path.join(RAW, f"fog-clean-{crop}.png"), optimize=True)
    if PLATES.get(crop):  # round 6c: composite the same coder onto another (already clean) plate
        plate = load(PLATES[crop])
    bb = place(plate, int(target_h_frac * Hp), person_x, base_y)
    out = os.path.join(RAW, f"fog-{TAG}-{crop}-comp.png")
    Image.fromarray(np.clip(np.round(plate), 0, 255).astype(np.uint8)).save(out, optimize=True)
    print(crop, "bench+person box x %.3f-%.3f y %.3f-%.3f" % bb, "->", out)
