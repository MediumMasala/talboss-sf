PASS on the build: the layout, the light and the copy are fixed. The hero art is not settled. When I stopped, the no-figure exports had not landed in `public/art/` (no DONE-6B in log.txt). The art lane's newest plate, `fog-f1`, is not a no-figure plate: it has a coder on a bench with an open laptop, which `PROMPTS.md` says the founder asked for. Someone has to decide which direction is live before anything ships.

# Steve · v4.3 hero · Round 4 (5 Nov 2026)

I used the site at http://localhost:3217 at 1440, and in same-origin iframes at exactly 390 × 844, 1024, 1280, 1440 × 900, 1920 × 1080 and 2560. I sat on the hero for the first 3 s and a full loop, and read the motion back frame by frame with `__heroLive.read()` against the plate (`live(false)`). Then I went through the wall, the marquee caption, What to expect and Done (`/start?state=A6` → Continue, at 1440 and 390). No console errors. `tsc --noEmit` is green. Nothing is committed.

## The founder was right about the figure, and the mistake was mine

"Why is a depressed guy looking over a hill? Wtf?"

He's right, and it's my mistake, not the art lane's. They drew exactly what I asked for.

- **I misread "human".** He said "like A24, make it feel human more than something random." I heard *put a human in it*. He meant *made by humans*: soul, warmth, a point of view, the opposite of a stock render. A person in the frame is not the same thing as humanity in the frame.
- **I directed melancholy.** My prompt literally says "a little melancholy and hopeful". A lone figure seen from behind, at night, small under something enormous, is the A24 grammar for grief. That's the morose note he had already rejected twice. On a careers site it's worse: a hooded person alone at night, with a closed laptop, reads as someone who just lost their job.
- **Dopamine happens in the viewer, not in a character.** A stand-in turns the visitor into a spectator watching someone else's moment. The person the light comes for was always meant to be the person looking at the screen. So take the stand-in out and give the camera the seat.

## What the hero without a figure has to do

1. **The viewer is the person.** The camera sits on the crest, and the light comes to the camera. I re-aimed the pulses (`heroLiveConfig.ts`): all three now come out of the fog, down through the city, and land on the crest at the centre, right above the sub and the white pill. The arrival glow lifts the horizon in front of you. Before, they ended at an empty patch of grass on the left where the figure had been, which would have been light travelling to nothing.
2. **Energy, not mood.** The fog is now the protagonist, so it has to be luminous and moving, and the city has to look awake, not asleep. No dark weight on the left with nothing to hold it. The middle band should feel like more light than dark.
3. **"The age of AI transformation in the land" = the fog is thinking.** The filaments are its neurons. The pulse is a thought travelling through the city to you. It has to read as intelligence, not weather, and never as a diagram: fibres, not lightning, not nodes.
4. **The reward lands where the eye already is.** Every 10 s the light arrives at "Apply for Tal". That's the hit, and it sits on the one action we want.
5. **The copy does the rest.** One line, one pill. Leave them alone.

## What the art lane has produced so far (not live yet)

- **`raw/fog-rm-*` (figure removed, ungraded).** The removal works. The model also re-rendered the filaments, though, and in the 16:9 they now read as **lightning bolts striking the city**, more electric than e1. The raw 4:5 has a hard horizontal step in the sky at y ≈ 0.24. The top fade may hide it, but it must be checked on the graded plate.
- **`fog-f1-*` (graded, 11:59).** A coder on a bench, hood down, laptop open, from round 6b's "coder on a bench" prompt (PROMPTS.md quotes the founder: "show them as a coder with a MacBook (subtly visible) coding on a bench and overlooking SF"). This contradicts the brief I was given (remove the person and the laptop). Per that brief I am not judging the figure. One factual note: the glowing open screen is on the direction's reject list. If the founder asked for it, the list changes, not the plate.
- **The light works either way.** The pulses now land on the crest at the centre, at the viewer and the pill, so they read correctly with or without a figure. If the founder wants the light to reach the coder instead, it's one line: `PATHS = ROUND6_PATHS` in `heroLiveConfig.ts` (it ends at the old seat, [0.216, 0.697]; recheck against the bench position in f1, about x 0.20–0.25).

## Acceptance test (HERO_DIRECTION §5), line by line

Measured on the live `fog-e1` plate with my fixes. The geometry of every round-6b plate is the same, so the layout results carry over. Re-run 2a–2d on whichever plate lands.

| # | Test | Result |
|---|---|---|
| 1 | Five people say "San Francisco" in 3 s, nobody says "stock" or "AI" | **Not run.** This needs five real people. Sutro plus the fog says SF to anyone who has lived there. The filaments are the one thing likely to make someone say "AI". |
| 2a | Top 35 % ≤ 8/255 | **Pass on screen now.** Canvas 9.6 before the scrim, 5.5 over the left 60 %, under 8 after the top fade. With the old bottom anchor the ridge sat inside this band at 1440. |
| 2b | Sub ≥ 4.5:1 | **Pass.** Worst 9.4:1 at 1440 and 9.8:1 at 390, across the whole loop including the arrivals right above it. |
| 2c | Fog peak ≤ 230, R = G = B | **Pass.** Peak 230 (CAP holds), and every addition is grey. |
| 2d | Served ≥ 2880 / 1600, clean at 200 % | **Pass on width** (3840 at DPR 2). At 200 % the houses look painted in places (model texture, art lane). |
| 3 | First pulse by 3.0 s, no overlap, drift ≤ 8 px/s, 30 s seamless, reduced motion = still, ≤ 4 ms, LCP unchanged | **Pass.** Arrival 2.5–3.0 s; the breath peaks at 3.3 s and is over by 4.0 s; drift 6 px/s; the seam is untouched (I changed amplitudes, a duration inside one slot, and the path ends). Reduced motion uses the same code path. **LCP:** the 105 % box makes a 2× retina 1440 pick the 3840 AVIF (165 KB, was 116). |
| 4 | No text, logo, bridge, named tower, face, glowing screen, particle; no landmark logos | **Pass on e1 / rm.** **f1 has an open, glowing laptop**, which this test bans (see above). |
| 5 | AI engineer: "wow, I should try this" | **Half.** See the end. |

The founder's words:
- **"High quality":** yes at 1440 and 1920 now. At 200 % the houses give it away a little.
- **"Unique representation of San Francisco":** yes. The fog, Sutro and the Sunset's small houses, not the bridge or the skyline.
- **"The age of AI transformation in the land":** yes, once the fog is the subject. Fog lit from inside, with a light travelling through the city to you.
- **"Dopaminergic":** before my fix, no, because the light couldn't be seen. Now a soft light arrives at the pill every 10 s.
- **"A24, human, not random":** not random. "Human" means soul, not a stand-in (above).
- **"Super trippy":** the filaments supply it. They're too electric: first look, not second, and lightning-like in the rm takes. Soften them about 30 %, don't kill them.
- **The wordmark band** holds at every width from 1024 to 2560 now, and didn't at ≥ 1440 before. **The loop** feels alive, not like a screensaver: the motion means something, and the 10 s rhythm is soft, like a lighthouse rather than a spinner. **Nothing banned** in e1 or rm.

## What I fixed

**`components/landing/Hero.tsx`: the layout broke at 1440 and at 1920.** The distance from ridge to crest is 0.33 × the drawn height, so it grows with the width. No fixed 720 px box can keep the wordmark above the ridge and the sub below the crest. With the bottom anchor, at 1440 the ridge sat behind "tal" and the Sutro tower poked out from behind the "l" like two legs. At 1920, "tal" sat on the white fog and nearly vanished, with the filaments coming out of the letters. Nobody with a big monitor had seen this hero work.
- The art box is 105 % wide on desktop (`md:right-[-5%]`, clipped by the section), so **Sutro stands clear of the "l"** (≈ 60 px at 1440).
- Centre anchor (removed `md:object-bottom`), and the section is `md:h-[max(720px,550px+16.4vw)]`. The ridge lands 265–286 px down at every width from 1024 to 2560, just under the wordmark (which ends at 260).
- The copy spacer is `md:h-[max(246px,45px+19.34vw)]`, so the sub starts ≈ 30 px under the crest. At 1440 × 900 the sub is at 619 px on the page and the fine print ends at 779, above the fold.
- `sizes` is `max(105vw, 1290px)` (same string for the preload). Phones are unchanged.
- The canvas box equals the img box (0, 36, 1494 × 786 at 1440) and the object-position is `50% 50%`, so HeroLive follows.

**`components/landing/heroLiveConfig.ts`: the light couldn't be seen, and it went to the wrong place.**
- **Strength.** At my own direction's +18 % / +6 %, five frames across 0–3.4 s at normal size were indistinguishable. On an already-lit city, +18 % is nothing. I was wrong.
  - Pulse: `PULSE_REL` 0.18 → 0.32, `PULSE_ABS` 0.022 → 0.045, `PULSE_LEN` 0.04 → 0.05, `PULSE_ACROSS` 0.028 → 0.034.
  - Breath: `BREATH_REL` 0.06 → 0.14, `BREATH_ABS` 0.02 → 0.05, `BREATH_S` 0.9 → 1.4, `BREATH_LEAD_S` 0.3 → 0.4, `BREATH_SIGMA` 0.05 → 0.045.
  - Measured lift per 40-px block: the pulse went from +22–31 to **+24–46/255** along the new paths, and the arrival glow from +9 to **+26/255**. Still a soft blob about 200 px across, still under CAP, never a dot and never a flash.
- **Destination.** `PATHS` is now defined in the config: three per crop, ending at the crest centre (16:9 [0.50, 0.675], 4:5 [0.50, 0.68]). The art lane's `paths.json` is kept as `ROUND6_PATHS` and isn't used.
- **Sub contrast with the glow arriving right above it**, measured on the live canvas with the scrims, across the loop including every arrival: worst **9.4:1** at 1440 and **9.8:1** at 390.

**`content/site.ts`: the Done note.** It said "Tal is in early preview, so a real person is looking at roles for you right now. The moment one matches, it's in your inbox." "A real person … right now" is a promise nobody keeps at 3 am, and the second sentence repeated the sub line one line above it. It now reads **"Tal is in early preview. We've already started looking for roles for you."** That's the founder's direction, shorter, and every word is true.

Docs: FRONTEND.md (the hero art line, the pulse and breath rows) and COPY.md (A7) are updated to match.

## The rest of v4.3

- **Landmark logos are gone from the hero.** Correct.
- **Marquee caption:** "Hiring managers from these companies hire on Tal", exact. It's the founder's line. My round-3 caution stands (an SF reader may hear "here"), but it's his call.
- **The numbers wall:** five tiles, the faces and the logo row. It finally feels like people, so his note is answered. One small thing for frontend: while 300,000+ counts up, the narrower number leaves a gap before "tech professionals" (I saw "58,596+    tech"). Right-align the count inside its reserved width.
- **What to expect:** reads like a friend. Leave it alone.
- **Done:** the chips are gone, and the note rises from the horizon while the sun blooms. Good at both widths.

## What still has to change, and who owns it

1. **Coordinator + founder, now:** decide which plate is live, no figure (`rm`) or the coder on a bench (`f1`). The art lane's PROMPTS.md and my brief disagree.
2. **Art regrade, whichever plate wins:** soften the filaments about 30 % with a mask-limited blur (fibres, not lightning), de-paint the houses at 200 %, and check the 4:5 sky step at y ≈ 0.24. Then export and re-run 2a–2d.
3. **Frontend, if the coder wins and the founder wants the light to reach them:** set `PATHS = ROUND6_PATHS`, retargeted to the bench. Otherwise keep the light landing on the viewer.
4. **Frontend:** at 768–1023 px (tablet) the plate is height-bound, so anything at x ≈ 0.2 drifts to the left edge (≈ 18 px at 768). Also: the numbers-wall count-up gap.
5. **Founder:** one real, named Bay Area role on the page (from round 3), and the five-person test.

## The founder's question: does this get an Anthropic or OpenAI engineer to say "wow, I should try this"?

It gets the "wow", now that it holds together on a big screen. An engineer in SF sees their own city at night and the fog they walk through every evening, lit from inside, with the light coming toward them. They feel it before they read a word, and they think: these people have taste. That's trust, and it's what the hero is for.

"I should try this" isn't the picture's job. The picture gets them to read the next line. What gets them to try is one true thing that's theirs: a real role, a real founder, their own name on the Done screen. The last one already works. Put one real role in the chat card and the hero gets both halves of the sentence.
