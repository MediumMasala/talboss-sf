FAIL. Close, and beautiful in places, but not yet the site the founder asked for. Four things below still lose the "wow". Once they're fixed, this ships.

# Steve · v4.1 · Round 1 (5 Nov 2026)

I used the site at http://localhost:3217 at 1440 (real 1440 CSS px) and at 390 (inside a 390-wide frame, because Chrome won't make a window that narrow). I typed "Aryan Mehta / Halcyon Labs / Member of Technical Staff" through the real flow (A1 → A4 live search → A5 → "No, not me" → next profile → paste link → bad URL → skip → A6 → A6b). I stopped before the final submit. The rest I finished in preview mode, where the upload is simulated. The console showed no errors on `/` or `/start`. **prefers-reduced-motion was not checked live**, because I couldn't turn the emulation on from my tools. The frontend lane's `shots-v4/landing-*-full-reduced.png` are the only evidence for it.

## 1. Fidelity to Figma (Tal US · v4 `QjHT7mWSNvgeAuiQehZZNJ`)

Overall the build follows the frames closely. Sections, order, art, tokens, radii and copy all match. On a Mac the font is the system face where Figma uses Inter, as `DS_TOKENS.md` says it should be. That accounts for most of the line breaks that differ. The real defects:

| # | Defect | Figma node | File | Status |
|---|---|---|---|---|
| F1 | The raised bar is `white/6`. Over the white Behind Tal card it turns white, and the funding line (white 72 %) **vanishes**. The glass nav turns into a flat #666 slab over the same card. | 20:964, nav 4:46 | `landing/RaisedBar.tsx`, `landing/Nav.tsx` | **Fixed**: bar `rgba(15,15,15,.94)` (looks the same over black), nav `black/85` |
| F2 | Hero sub breaks as "…designers. Now / in San Francisco." The frame breaks after "designers." (1440), and "PMs and designers. Now in San Francisco." is one line at 390. | 4:69 / 5:76 | `content/site.ts` | **Fixed**: non-breaking spaces in "Now in San Francisco." |
| F3 | 390 hero: the sub and CTA sit 34 px higher than the frame, right on the brightest part of the horizon (poor contrast). | 5:65, 5:76, 5:78 | `landing/Hero.tsx` | **Fixed**: `pt 76→82`, spacer `150→178` (sub 409, CTA 481, as drawn) |
| F4 | 390 chat: your reply bubble stretches almost the full card width. The frame right-aligns it at about 80 %. | 5:82 | `landing/Chat.tsx` | **Fixed**: `max-w-[80%]` on your bubble |
| F5 | The deal card's last row is 20 px taller than the others. The list stretches to the orb column's height. | 22:1176 | `landing/Deal.tsx` | **Fixed**: `md:self-start` |
| F6 | 390 deal rows are 16/24. The frame is 18/28 at both widths. | 22:1396–1402 | `landing/Deal.tsx` | **Fixed** |
| F7 | 390 text sections (How it works, Questions, footer) sit at 16 px from the edge. The frames use 24 (cards stay at 16). The Behind Tal card's inner padding is 20 against 24. | 5:141, 5:182, 5:211, 5:120 | `How.tsx`, `Faq.tsx`, `Footer.tsx`, `BehindTal.tsx` | **Fixed** |
| F8 | FAQ +/− glyph is 16 px. The frame's is about 10 px. | 4:195 | `landing/Faq.tsx` | **Fixed** |
| F9 | Mock title breaks as "3 roles that fit you this / week". The frame breaks as "3 roles that fit you / this week". | 19:923 | `content/site.ts` | **Fixed** (nbsp) |
| F10 | A7 sub is set narrower (about 425 px, balanced) than the frame (566). | 3:680 | `flow/Done.tsx` | Left. The sub copy changed (below), so a new width needs a design call |
| F11 | Not in Figma and not named in FRONTEND.md: the "Tal will write to {email}." line on A7, and the footer funding line cut (site.ts cuts it). Both are right. **Frontend: add them to the deviations list.** | 3:661, 4:224 | `FRONTEND.md` | Doc only |
| F12 | 390 answer trail on A4 wraps with a leading "·" on line two ("· Member of Technical Staff"). | 5:509 | `flow/Flow.tsx` | Fix list |

## 2. The founder's test

**Would an AI engineer in SF say "wow, I should try this"?** Not yet. They'd say "this is nicely made". It is more polished than meetdex.ai and jackandjill.ai. It isn't yet ten times more real, and the gap is in four specific places.

**The moments that earn it.**
- The first frame. The silver tal wordmark catches light under your cursor and tilts toward you, over the particle horizon. That's a real logo moment.
- Pressing the CTA. A white circle blooms from the exact point you clicked and becomes the flow. Best transition on the site. Keep it exactly as it is.
- Your answer flies. Measured: 628,377 w181 → 726,228 w83 in about 400 ms, on a clean spring. You feel the form holding on to what you said.
- Done. Your name assembles letter by letter out of blur. That's the right instinct.
- The chat card types itself (dots, bubble, rows, your yes, Tuesday's intro) in about 3 seconds. Calm and believable.
- The phone mock with the "Yes" pills popping and the notification dropping in. It reads as a product, not a picture.

**The moments that lose it.**
1. **The city isn't San Francisco.** Zoom into the hero: spires like the Empire State and Chrysler buildings. No Transamerica Pyramid, no Salesforce Tower, no bridge. The line under it says "Now in San Francisco." Everyone in the target audience lives there and will clock it in a second. It's the one detail that says "generated". (design)
2. **The marquee is half glyphs.** A "G", four squares, a cloud, an "A", "in", a "P", next to full wordmarks. It reads as an icon strip, not "people from Google and Microsoft hire here". Use full wordmarks for all twelve. (design)
3. **Done goes still after 2.5 seconds.** It's bright now, which is right, but grey and frozen. The chips are labels, not doors. The founder asked for "a world of opportunities ahead … light, motion and warmth". Right now it says "form received". (design + frontend; ideas in the fix list)
4. **Search is 15 seconds of the same picture.** The progress bar is honest, but nothing happens on screen. The poll already reports stages (search, people, profile, found), and showing them in words would make the wait feel like work being done. (frontend + copy)

Smaller things I heard reading every line aloud, now fixed in `site.ts`:
- The chat said "Two in SF, one remote", but the mock right below shows SF, Remote and the Bay Area. It contradicted itself.
- Behind Tal said 300,000+ and 5,000+ in the paragraph and then again as the big numbers right under it.
- The FAQ said "it takes it you're not looking".
- A1 said "the name we'll represent".
- Rate limited said "requests from your network", which reads as your LinkedIn network.
- Done opened with "Tal is reading your profile now", which is the exact tone the founder rejected.

Tal is never "he" anywhere on screen. "India" and "illustration" appear only in code comments.

**The flow** is honest and one-question-per-screen. Progress is real, Back works, and Enter works everywhere. Two logic bugs and one trust problem are in the fix list.

## 3. What I fixed (values and copy only; `tsc --noEmit` green; nothing committed)

- `components/landing/RaisedBar.tsx`: bar fill `bg-white/6` → `bg-[rgba(15,15,15,0.94)]` (F1)
- `components/landing/Nav.tsx`: solid nav `bg-black/60` → `bg-black/85` (F1)
- `components/landing/Hero.tsx`: mobile `pt-[76px]` → `pt-[82px]`, spacer `h-[150px]` → `h-[178px]` (F3)
- `components/landing/Chat.tsx`: your bubble `max-w-[80%]` (F4)
- `components/landing/Deal.tsx`: rows 18/28 at all widths, list `md:self-start` (F5, F6)
- `components/landing/How.tsx`, `Faq.tsx`, `Footer.tsx`: mobile `px-4` → `px-6`. `BehindTal.tsx` card `px-5` → `px-6` (F7)
- `components/landing/Faq.tsx`: +/− glyph 16 → 10 px (F8)
- `content/site.ts`:
  - hero sub: nbsp in "Now in San Francisco." (F2)
  - mock title: nbsp in "this week" (F9)
  - chat opener → "Three new roles for you: SF, the Bay Area and remote."
  - Behind Tal body → "Tal just opened in San Francisco. The network behind it is already this big, and a team reads every profile."
  - FAQ six months → "…If you don't reply, Tal assumes you're not looking right now and stops."
  - A1 sub → "This is the name Tal introduces you by."
  - rate limited title → "Tal is getting a lot of requests right now"
  - A7 sub → "Tal is already looking for your first roles. You say yes to each intro, and nothing happens without you." (the chips carry the places)

I checked every fix live at 1440 and 390.

## 4. What must still change before the founder sees it (ranked)

1. **Hero art: make it San Francisco** (design). Regenerate `particle-horizon-a` as an SF skyline in the same particle language, with the Transamerica Pyramid, Salesforce Tower and the Bay Bridge's lights. Keep the black top 40 % for the wordmark. Both crops (16x9, 4x5), then `node scripts/art.mjs`.
2. **Done: a world ahead, not a receipt** (design → frontend). Keep the name build. Then let the horizon live: the sun blooms slowly (a 6–8 s ease, opacity and scale only) and light spreads across the clouds. Give the three chips motion and meaning: they rise from the horizon one at a time, and each one turns into a sample role line ("Staff engineer · San Francisco") before settling. It's the first Monday, previewed. Black and white still, but warm. The founder's words are the brief.
3. **Marquee: full wordmarks for all twelve** (design). Google, Microsoft, Salesforce, Adobe, LinkedIn and PayPal currently show glyphs only. Match optical heights to the others (DS/Logo Marquee Row 18:1395).
4. **Search wait: say what's happening** (frontend + copy). Under the bar, cross-fade the stage the poll reports: "Searching LinkedIn" → "Found people named {first name}" → "Reading your profile". These are real stages, so it stays honest.
5. **Bad LinkedIn link + Skip counts as "typed"** (frontend, `flow/Flow.tsx` reducer `status`). An invalid URL left in the field turns `skipped` into `typed`. The invalid URL goes out as `linkedinUrl`, and A6 then says "We'll work from your LinkedIn" when there is none. Only count a URL that passed validation.
6. **No email on Done is a dead end** (frontend). "We couldn't find an email on your resume. Write to support@…" ends the flow on a failure. When the upload returns no email, route to A6b ("Where should Tal write to you?") instead of A7.
7. **"Is this you?" shows people at other companies** (backend, `lib/`, out of my lane). My search for Halcyon Labs / MTS offered a Houston engineer at a different company, then a London banker. A strong candidate who sees a stranger loses trust. Don't offer a profile whose current company and title both miss. Go to "We couldn't find you" instead.
8. **Phones: "Drop a PDF or DOCX, or click to choose"** (frontend + copy). On touch devices it should read "Tap to choose a PDF or DOCX". Add a `dropTouch` string and pick it by `(pointer: coarse)`.
9. **Answer trail on A4 at 390 wraps with a leading "·"** (frontend). Keep each separator with the item after it (`whitespace-nowrap` per item, separator inside).
10. **`lib/limits.ts` still says "from your network"** in two messages (backend copy). Match the new rate-limited title.
11. **A5 on short phones** (frontend). At 720 px tall, the pinned Yes/No sits over the last experience row. Add bottom padding the height of the pinned bar.
12. **Chat vs mock** (design, FIGMA_BUILD open question 1). They tell the same story twice: three roles, yes, intro sent. Fine for now. Next round, the mock should show what the chat can't, for example the founder's reply landing.
13. **Reduced motion** (frontend). Verify with DevTools rendering emulation on `/` and `/start`. I couldn't flip it from my tools.
14. **FRONTEND.md**: add F11's two deliberate deviations.
