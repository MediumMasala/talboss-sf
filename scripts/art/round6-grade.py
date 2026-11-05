#!/usr/bin/env python3
"""Round 6 grade + measurements ("The fog is thinking", docs/team/HERO_DIRECTION.md).

usage:
  python3 scripts/art/round6-grade.py grade <raw.png> <out.png> [--crop 16x9|4x5] [--light]
                                           [--filaments x0,y0,x1,y1] [--depaint y0,y1]
  python3 scripts/art/round6-grade.py measure <graded.png> <16x9|4x5>

The grade is the round-5 grade (neutralise to R=G=B, top fade) tuned for a luminous frame:
  1. Rec.709 luminance -> R=G=B (true greyscale, no cast).
  2. Black point 16/255: the sky and the grass go to near-black, nothing else is crushed.
  3. Mid lift (gamma 0.92): the fog and the city stay luminous, not morose.
  4. Soft highlight shoulder from 195 toward 230: the fog's peak never passes 230/255, so the white pill
     stays the brightest object on the page, and the halation rolls off instead of clipping.
  5. Top fade: x (0.12 + 0.88 * smoothstep(top0, top1, y)) so the top 35 % is near-black for the wordmark
     (16:9: 0.24 -> 0.41; 4:5: 0.22 -> 0.40).
  --light (the 4:5): its reference was the already graded 16:9, so the model returns graded tones. Re-running the
     full curve would grade it twice (crushing the haze behind the tower), so --light uses black point 4 and no mid
     lift; the shoulder and the top fade are the same.
  --filaments x0,y0,x1,y1 (round 6b, Steve round 4: the filament edge read electric): inside that box (image
     fractions, 60 px feather) the fine detail is pulled 36 % toward a 5 px gaussian, which measures as ~30 % less filament detail (band-pass 1-6 px) after the grain; the filaments are ~30 %
     softer and nothing outside the box changes. Applied before the tone curve.
  --depaint y0,y1 (round 6b): the model's 4K houses have a smooth painted look. Inside that band (feathered), a
     0.6 px soften then fine luminance film grain (sigma 4.5/255, 1 px, seeded), weighted to the mid-tones so the
     blacks stay black and the fog's peak is untouched. Adds texture, moves nothing. Applied after the curve.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

BP, GAMMA, KNEE, PEAK = 16.0, 0.92, 195.0, 230.0
FADE = {"16x9": (0.24, 0.41), "4x5": (0.22, 0.40)}


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def band_mask(H, W, box, feather=60):
    m = np.zeros((H, W), np.float32)
    m[int(box[1] * H): int(box[3] * H), int(box[0] * W): int(box[2] * W)] = 1
    return nd.gaussian_filter(m, feather)


def grade(src, out, crop, light=False, filaments=None, depaint=None):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    L = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    del a
    if filaments:
        m = band_mask(*L.shape, filaments)
        L = L + 0.36 * m * (nd.gaussian_filter(L, 5) - L)
    bp, gamma = (4.0, 1.0) if light else (BP, GAMMA)
    v = np.clip((L - bp) / (255.0 - bp), 0, 1) ** gamma * 255.0
    hi = v > KNEE
    v[hi] = KNEE + (PEAK - KNEE) * (1 - np.exp(-(v[hi] - KNEE) / (PEAK - KNEE)))
    if depaint:
        m = band_mask(*v.shape, (0.0, depaint[0], 1.0, depaint[1]))
        v = v + m * (nd.gaussian_filter(v, 0.6) - v)
        rng = np.random.default_rng(6)
        t = np.clip(v / 255.0, 0, 1)
        v = v + m * (4 * t * (1 - t)) * rng.normal(0, 4.5, v.shape).astype(np.float32)
        v = np.minimum(v, PEAK)
    H = v.shape[0]
    y = (np.arange(H, dtype=np.float32) + 0.5) / H
    t0, t1 = FADE[crop]
    v *= (0.12 + 0.88 * smoothstep(t0, t1, y))[:, None]
    g = np.clip(np.round(v), 0, 255).astype(np.uint8)
    Image.fromarray(g, "L").convert("RGB").save(out, optimize=True)
    print("graded", out, g.shape[::-1])


def measure(path, crop):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    rgb_equal = bool((a[..., 0] == a[..., 1]).all() and (a[..., 1] == a[..., 2]).all())
    L = a[..., 0]
    H, W = L.shape
    top = L[: int(H * 0.35)].mean()
    lowc = L[int(H * 2 / 3):, int(W / 3): int(2 * W / 3)].mean()
    print(f"{path} {W}x{H} R=G=B {rgb_equal}")
    print(f"  top 35 % mean {top:.2f}/255")
    print(f"  lower-centre third mean {lowc:.2f}/255")
    print(f"  peak {L.max():.0f}/255  p99.9 {np.percentile(L, 99.9):.0f}  p99 {np.percentile(L, 99):.0f}")
    # Fog band: centre 80 % of the width, between the ridge and the crest.
    band = (0.33, 0.62) if crop == "16x9" else (0.33, 0.58)
    fb = L[int(H * band[0]): int(H * band[1]), int(W * 0.1): int(W * 0.9)]
    print(f"  fog band y {band[0]}-{band[1]}: mean {fb.mean():.1f}, peak {fb.max():.0f}")
    for y0 in np.arange(0, 1, 0.05):
        r = L[int(H * y0): int(H * (y0 + 0.05))]
        print(f"    y {y0:.2f}-{y0 + 0.05:.2f} mean {r.mean():6.1f}  p95 {np.percentile(r, 95):5.0f}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "grade":
        crop = sys.argv[sys.argv.index("--crop") + 1] if "--crop" in sys.argv else "16x9"
        opt = lambda k: [float(x) for x in sys.argv[sys.argv.index(k) + 1].split(",")] if k in sys.argv else None
        grade(sys.argv[2], sys.argv[3], crop, light="--light" in sys.argv,
              filaments=opt("--filaments"), depaint=opt("--depaint"))
    elif cmd == "measure":
        measure(sys.argv[2], sys.argv[3])
