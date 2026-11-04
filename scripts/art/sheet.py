#!/usr/bin/env python3
"""Contact sheet: one row per <motif>-<take>, 16:9 then 4:5, filename under each.
usage: python3 scripts/art/sheet.py <dir> [out.jpg]
"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont

d = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(d, "sheet.jpg")
H = 300           # thumbnail height
PAD, LAB = 24, 30
BG, FG = (128, 128, 128), (255, 255, 255)  # mid grey so dark and white grades both read

try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
except OSError:
    font = ImageFont.load_default()

wides = sorted(f for f in glob.glob(os.path.join(d, "*-16x9.png")))
rows = [(w, w.replace("-16x9.png", "-4x5.png")) for w in wides]
w169, w45 = int(H * 16 / 9), int(H * 4 / 5)
cols = 2  # two pairs per row
pair_w = w169 + PAD + w45
W = PAD + cols * (pair_w + PAD * 2)
nrows = (len(rows) + cols - 1) // cols
sheet = Image.new("RGB", (W, PAD + nrows * (H + LAB + PAD)), BG)
draw = ImageDraw.Draw(sheet)
for i, (a, b) in enumerate(rows):
    x = PAD + (i % cols) * (pair_w + PAD * 2)
    y = PAD + (i // cols) * (H + LAB + PAD)
    for f, tw in ((a, w169), (b, w45)):
        if os.path.exists(f):
            im = Image.open(f).convert("RGB")
            im = im.resize((tw, H), Image.LANCZOS) if abs(im.width / im.height - tw / H) < 0.02 else im.resize((int(im.width * H / im.height), H), Image.LANCZOS).crop((0, 0, tw, H))
            sheet.paste(im, (x, y))
        draw.text((x, y + H + 6), os.path.basename(f), fill=FG, font=font)
        x += tw + PAD
sheet.save(out, quality=86)
print(out, sheet.size)
