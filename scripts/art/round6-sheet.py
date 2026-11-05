#!/usr/bin/env python3
"""Round 6 contact sheet: every 16:9 take (raw, greyscale) with its verdict, then the pick and the two 4:5 takes (graded).
usage: python3 scripts/art/round6-sheet.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(ROOT, "docs", "team", "art", "round6")
RAW = os.path.join(D, "raw")

V = {  # take -> verdict (see PICK.md for the full list)
    "a": "reject: figure 26 % tall, open laptop", "b": "reject: 25 %, open laptop, face in profile",
    "c": "reject: figure 24 % tall, x 0.27", "d": "reject: 22 %, open laptop",
    "e": "reject: 25 %, open laptop", "f": "reject: 27 %, open laptop",
    "g": "reject: 28 %, open laptop", "h": "reject: 22 %, open laptop",
    "i": "reject: 23 %, open laptop", "j": "reject: 23 %, face in profile",
    "k": "reject: 20 %, open laptop", "l": "reject: 19 %, open laptop",
    "m": "reject: 22 %, colour cast", "n": "reject: border, face in profile",
    "o": "reject: black border, 22 %", "p": "reject: black border, 18 %",
    "q": "reject: figure 40 %, right of centre", "r": "reject: x 0.30 (copy column)",
    "s": "reject: 30 %, centre", "t": "reject: 24 %, x 0.33",
    "u": "reject: 22 %, colour cast", "v": "reject: face in profile, x 0.30",
    "w": "reject: x 0.33 (copy column)", "x": "reject: 21 %, x 0.30",
    "r1": "reject: x 0.32 (copy column)", "r2": "layout met, laptop open -> e1/e2",
    "r3": "reject: 15 %, crest diagonal", "r4": "reject: 15 %, crest diagonal",
    "r5": "reject: 22 %, open laptop", "r6": "reject: face in profile",
    "r7": "reject: 19 %, open laptop", "r8": "reject: face in profile",
    "e1": "PICK (laptop closed)", "e2": "runner-up (same frame)",
}
ORDER = list("abcdefghijklmnopqrstuvwx") + [f"r{n}" for n in range(1, 9)] + ["e1", "e2"]

try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
    big = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
except OSError:
    font = big = ImageFont.load_default()

# Round 6b (founder: coder on a bench): raw edits, then the composited and graded fog-f1 pair.
V6B = [
    ("fog-rm-16x9-a", "figure removed (clean plate, used)"), ("fog-rm-16x9-b", "figure removed (alt)"),
    ("fog-c1-16x9-a", "reject: face in profile, 25 %"), ("fog-c1-16x9-b", "reject: 24 %, x 0.33"),
    ("fog-c1-16x9-c", "reject: 24 %, bench too big"), ("fog-g1-16x9-a", "subject source for the composite"),
    ("fog-g1-16x9-b", "reject: 30 %, centre"), ("fog-g1-16x9-c", "reject: illustrated, 30 %"),
]

# Round 6c (founder: more SF): city-only edits of the clean plate, then the composited and graded fog-g1 pair.
V6C = [
    ("fog-sf-16x9-a", "PICK 16:9: downtown small, fog kept"), ("fog-sf-16x9-b", "reject: filaments lost (fog changed)"),
    ("fog-sf-16x9-c", "reject: downtown too big"), ("fog-sf-4x5-a", "4:5 alt: towers generic"),
    ("fog-sf-4x5-b", "PICK 4:5: Salesforce + pyramid, East Bay"), ("fog-sf-4x5-c", "reject: ladder-like light line"),
]

TW, TH, PAD, LAB, COLS = 384, 216, 16, 40, 6
rows = (len(ORDER) + COLS - 1) // COLS
PW, PH = 1152, 648               # pick (16:9, graded)
FW, FH = int(PH * 4 / 5), PH     # 4:5 takes (graded)
W = PAD + COLS * (TW + PAD)
rows6b = (len(V6B) + COLS - 1) // COLS
H = PAD + rows * (TH + LAB + PAD) + 40 + PH + LAB + PAD + 40 + rows6b * (TH + LAB + PAD) + 30 + PH + PAD
H += 40 + (TH + LAB + PAD) + 30 + PH + PAD
sheet = Image.new("RGB", (W, H), (128, 128, 128))
d = ImageDraw.Draw(sheet)
for k, t in enumerate(ORDER):
    x = PAD + (k % COLS) * (TW + PAD)
    y = PAD + (k // COLS) * (TH + LAB + PAD)
    im = Image.open(os.path.join(RAW, f"fog-{t}-16x9.png")).convert("L").resize((TW, TH), Image.LANCZOS)
    sheet.paste(im.convert("RGB"), (x, y))
    d.text((x, y + TH + 4), f"fog-{t}-16x9", fill=(255, 255, 255), font=font)
    d.text((x, y + TH + 21), V[t], fill=(255, 255, 255) if "PICK" not in V[t] else (255, 255, 0), font=font)
y0 = PAD + rows * (TH + LAB + PAD) + 10
d.text((PAD, y0), "Graded: pick 16:9 (fog-e1-16x9.png) | 4:5 take a (PICK, fog-e1-4x5.png) | 4:5 take b (reject: city in the lower third)", fill=(255, 255, 255), font=big)
y0 += 30
sheet.paste(Image.open(os.path.join(D, "fog-e1-16x9.png")).convert("RGB").resize((PW, PH), Image.LANCZOS), (PAD, y0))
sheet.paste(Image.open(os.path.join(D, "fog-e1-4x5.png")).convert("RGB").resize((FW, FH), Image.LANCZOS), (PAD * 2 + PW, y0))
b = Image.open(os.path.join(RAW, "fog-e1-4x5-b.png")).convert("L").resize((FW, FH), Image.LANCZOS)
sheet.paste(b.convert("RGB"), (PAD * 3 + PW + FW, y0))
y0 += PH + LAB + PAD
d.text((PAD, y0), "Round 6b: coder on a bench (raw edits)", fill=(255, 255, 255), font=big)
y0 += 30
for k, (n, v) in enumerate(V6B):
    x = PAD + (k % COLS) * (TW + PAD)
    y = y0 + (k // COLS) * (TH + LAB + PAD)
    sheet.paste(Image.open(os.path.join(RAW, n + ".png")).convert("L").resize((TW, TH), Image.LANCZOS).convert("RGB"), (x, y))
    d.text((x, y + TH + 4), n, fill=(255, 255, 255), font=font)
    d.text((x, y + TH + 21), v, fill=(255, 255, 255), font=font)
y0 += rows6b * (TH + LAB + PAD)
d.text((PAD, y0), "6b PICK, graded: fog-f1-16x9.png | fog-f1-4x5.png (composite of g1-a's coder into the fog-e1 plates; filaments softened, houses de-painted)", fill=(255, 255, 0), font=big)
y0 += 30
sheet.paste(Image.open(os.path.join(D, "fog-f1-16x9.png")).convert("RGB").resize((PW, PH), Image.LANCZOS), (PAD, y0))
sheet.paste(Image.open(os.path.join(D, "fog-f1-4x5.png")).convert("RGB").resize((FW, FH), Image.LANCZOS), (PAD * 2 + PW, y0))
y0 += PH + PAD + 10
d.text((PAD, y0), "Round 6c: more SF (city-only edits of the clean plate; 4:5 thumbnails letterboxed)", fill=(255, 255, 255), font=big)
y0 += 30
for k, (n, v) in enumerate(V6C):
    x = PAD + k * (TW + PAD)
    im = Image.open(os.path.join(RAW, n + ".png")).convert("L")
    im.thumbnail((TW, TH), Image.LANCZOS)
    sheet.paste(im.convert("RGB"), (x + (TW - im.width) // 2, y0))
    d.text((x, y0 + TH + 4), n, fill=(255, 255, 255), font=font)
    d.text((x, y0 + TH + 21), v, fill=(255, 255, 0) if "PICK" in v else (255, 255, 255), font=font)
y0 += TH + LAB + PAD
d.text((PAD, y0), "6c PICK, graded (current hero): fog-g1-16x9.png | fog-g1-4x5.png", fill=(255, 255, 0), font=big)
y0 += 30
sheet.paste(Image.open(os.path.join(D, "fog-g1-16x9.png")).convert("RGB").resize((PW, PH), Image.LANCZOS), (PAD, y0))
sheet.paste(Image.open(os.path.join(D, "fog-g1-4x5.png")).convert("RGB").resize((FW, FH), Image.LANCZOS), (PAD * 2 + PW, y0))
out = os.path.join(D, "sheet.jpg")
sheet.save(out, quality=86)
print(out, sheet.size)
