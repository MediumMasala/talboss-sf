# DIRECTION: Tal, the US site (v3)

From Steve, 4 Nov 2026. Read BRIEF_V3.md first, then this. Where they differ, BRIEF_V3 wins on facts and rules, and this wins on taste.

I used every site below in a real Chrome tab and in a scripted one: scrolled, hovered, clicked, drew on the canvas, and played the videos. The frames, scroll sequences and contact sheets are in `/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/steve-v3/` (`sheet-<site>.jpg` for the overview, `<site>-NN-*.jpg` for single frames, `<site>-info.json` for fonts, easing and media counts).

---

## 1. What I saw and felt

### Our v2 (localhost:3217, `?preview=pitch`, `?preview=done`)
It's a well-set document. Grey ink on beige, Newsreader italic for "Keep building.", a form card on the right, and a dot field with "you" and "Tal" labels. Below that come four equal columns for "How Tal works", a boxed 2×2 for "The deal", an FAQ, and a closing line. The page has **zero images and zero video**. It has no light, no people and no weather. Hover states are 150–300 ms of standard Tailwind easing, and nothing on the page reacts to you as a person.

The founder is right. It looks like something a careful machine made. There's one warm moment in it: the intro letter Tal drafts about you (the pitch preview). That's the heart of the product, and it was buried in a form card. We keep the letter and throw away almost everything around it.

### Tal India home (tal-boss-web.vercel.app)
This is the one that feels alive. About thirty real faces sit in rounded photo tiles at random tilts and drift slowly around a plain, confident headline ("India's fastest hiring network"). Frames taken 1.2 s apart show them moving, and they shift a little with the mouse. You feel a crowd. It's light and airy, and the background is lavender-white with no grey-on-beige anywhere.

Further down is a large real profile card: Aman Arora, photographed in a real office with plants and fluorescent tubes, with "A project I'm proud of" and a score ring. It's the most human image on any of our sites. A logo strip scrolls on its own. Transitions are short and springy (160–280 ms, `cubic-bezier(0.16,1,0.3,1)`).

The **Tal Boss / Tal Select** pill flips the whole page to a dark theme in place. That's a genuinely satisfying interaction. The Select side tells its story as a chat thread: "Pari · Tal Select Partner: Sent a shortlist of top 8 candidates for your PM role", then a reply, then "scheduling", then "invite sent". The proof is shown as a conversation instead of being claimed. The copy is factual and a little generic. Its soul comes from real people and from the conversation.

### Jack & Jill (jackandjill.ai)
The page is white with a warm serif headline (Marist), "Where remarkable people meet ambitious companies", and generous air. Two product panels sit side by side with small living UIs inside them. A segmented Candidates/Companies toggle swaps the story. A big blue **Accept intro** button is the hero of a small demo, so the intro is presented as something you *accept*, which is right.

The best thing on the page is a carousel of real customers on video. The clips autoplay muted, with yellow captions burned in mid-frame, and the people sit in real rooms against brick walls and office windows. You read them before you hear them. Their quotes are plain speech ("…a little bit like Christmas morning").

The numbers count in large serif. Small dithered photos are scattered near the end. Easing is `0.15s cubic-bezier(0.215,0.61,0.355,1)`, and panel swaps use a slower `0.4s cubic-bezier(0.7,0,0.3,1)`.

How it felt: warm in the middle and SaaS at the edges. Underneath it's still white and grey, with no light and no grade. We can beat that.

### Dex (meetdex.ai)
Cream background, with halftone, dithered photographs of mountains at orange dusk. It looks printed, like a riso poster, and that landscape *is* the brand's mood. The hero, "The talent agent for senior software engineers", is literally our positioning, so **Dex owns that sentence and we must never write it.**

The real product UI is embedded and alive: "Hey! Welcome back. Good to see you again.", a caret typing "A senior product engineer role", and job cards with "Why Dex matched you". Section heads speak as the agent ("Tell Dex what you actually want", "We don't spam your CV everywhere"). Testimonials use large outlined quote marks with real names and faces. At the bottom the mountains dissolve into a ghosted logo, next to a green "All systems operational" dot. Easing is `cubic-bezier(0.23,1,0.32,1)`, 150–400 ms.

How it felt: calm and competent, slightly cold, with the landscape doing the soulful work. Lesson: show the product working for one specific person.

### Zero (why.zero.university)
This isn't a page, it's a scene. It's full-screen WebGL, and the cursor becomes a hand. The first thing it asks is "DRAW A ZERO", with a ring that fills as you trace it. I drew the circle. The green marble water cleared to white, a swash script serif wrote **"You Believed"**, and +100 XP ticked up in the corner. Scrolling moves a ruler at the top ("-100 BZ … 0 BZ") into the next scene: the Creation of Adam, a green 3D hand reaching for a human one, petals, columns, and "a JOB" with "TAP / HOLD". A dock at the bottom never leaves: "Join Beta", plus "Beta is open to everyone. Start now". Easing is `0.38s cubic-bezier(0.22,1,0.36,1)`.

How it felt: I took part before I was told anything, and it rewarded one gesture with something beautiful. That's real nerve. It's also a game. The copy is close to nothing, and the Michelangelo hand is exactly what our v1 copied and got called gimmicky for.
- **Take:** one gesture from the visitor, answered with beauty, and the one action that is always within reach.
- **Leave:** the hands, the XP, the game.

### A24 (a24films.com)
Full-bleed film frames of faces in natural light, close enough to see skin. Enormous white Neue Montreal titles run off the edge of the screen ("You Can See Everyth…"). Each frame carries one small outlined **BUY TICKETS →**. Sections stack like reels: a face and a title, then another. Shelves follow (In theaters, Watch at home, Latest in TV) with posters on thin rules, plus tiny mono uppercase labels, a black Music section with vinyl, and shop objects on pale grey. Hovers run 250 ms `cubic-bezier(0.215,0.61,0.355,1)`. There's no sound on the home page, even though it belongs to a film company.

How it felt: confidence through restraint. Nothing explains itself. The face is the hero, the type is huge and there's very little of it, and each frame has one action. That's the whole lesson.

---

## 2. The one idea

**The page opens on a face and one word, *Talent*. It ends on your name.**

In film, "talent" is what the industry calls the people in front of the camera, and every one of them has an agent who reads everything, takes the calls and says "you should meet this director." Engineers have never had that. They get recruiter spam. Tal is the agent.

So the site plays like the opening and closing of a quiet A24 film about one person. The first frame is a photograph in real light with *Talent* set in a large classic serif, and a sentence that tells you that's what we call the people we represent. Then the agent goes to work, in front of you: it finds you, asks "Is this you?", and writes the letter it would send a founder about you, on paper, in plain words. The last frame is a title card with **your name** set in that same serif, across the same kind of photograph, with one credit line underneath: *Represented by Tal, until 4 May 2027.*

You arrive as "talent" in general and you leave as a named person with an agent. Everything on the page serves that arc. If a section doesn't move someone from the first frame to the last, it goes.

The one interaction that makes this real: **as you type your name into the first field, it's set live in the display serif** at the top of the card, the way a title card is set. It isn't a gimmick, because it's your name, and it's the first moment the page treats you as the lead.

---

## 3. Naming: Tal. Only Tal.

- The product, the brand, the sender of every email and the voice of the page is **Tal**. The wordmark is lowercase **tal**. The descriptor, where we need one, is "a talent agent".
- **"Tal Select" disappears from the US site.** "Tal is the talent agent behind Tal Select" asks an SF engineer to learn two names for one thing, and they won't. `program: "select"` can stay as an internal database value. It never appears on screen, in an email or in a meta tag.
- Tal is **it**, or simply "Tal", and never "he". Most of the time the page speaks as **"we"**, the people at Tal. That's how a good agency talks, and it's honest: there's a team. Use "Tal" when you mean the agency or the product ("Tal is a talent agent for engineers", "From: Tal"). Don't give Tal a personality, a face or invented feelings.
- We mention AI once, plainly, where it matters: our software reads every profile and every role, and people on our team decide who meets whom. AI is how we stay up all night, not the pitch.
- Words to use: **represent, introduce, intro, role, founder, the person who makes the call.** Never "interview", "candidate", "apply", "talent pool", "match" or "unlock".

---

## 4. The voice

A great agent talking to someone they believe in, across a table, late. Plain words, whole sentences, specifics, some warmth, no tricks. It's serious about careers because careers are serious. The page sounds like a person wrote it to one person. Read every line aloud. If it sounds like a landing page, cut it.

### Lines in the voice I want (direction for the copywriter, not final copy)
1. Hero, under the big word *Talent*: "That's what we call the people we represent. Tal is a talent agent for engineers, researchers, PMs and designers, and we're opening in San Francisco now."
2. Form intro: "Tell us your name and where you work. We'll find you on LinkedIn and write the note we'd send a founder about you."
3. Above the found profile: "Is this you?"
4. Above the letter: "This is how we'd introduce you. Change anything that isn't right."
5. On asking first: "When a role is worth your time, we'll email you about it. If you say no, nobody hears your name."
6. On money: "It's free for you. Companies pay us when they hire someone we introduced."
7. On where we come from: "We started in Bengaluru, where our first product grew to more than a million professionals sharing real salaries and the truth about where they work."
8. Done: "Thank you, Ana. We'll read everything properly and write to you at ana@… when there's a role worth your time."

### Five lines from v2 that must never come back
1. **"Keep building. Tal makes the intros."** A two-beat slogan that orders the reader around. It sounds like a SaaS tagline and says nothing about them.
2. **"Your yes, every time."** The "your X, every time" formula. It's fake intimacy, and nobody talks like that.
3. **"Your data has one job."** The "X has one job" cliché. It's cute about the one thing people want us to be serious about.
4. **"An AI agent with a human team behind him."** It calls Tal "him", and it leads with AI. The reader wants to know who's working for them, not what the product is built on.
5. **"Six months, then you decide."** It turns a term into a slogan. Say the term plainly: "We'll represent you for six months, until 4 May 2027. Then we'll ask if you want us to keep going."

Also gone: "Each dot is 30 people in the Tal network. You're the blue one." (it explains a chart nobody asked for), "Who should Tal represent?", "Join Tal Select", and the "What about work authorization?" FAQ.

---

## 5. Visual language

### Photography and film
- **Light:** late-afternoon sun and window light. Warm highlights, soft shadows, and dust visible in the air. San Francisco fog in the morning, gold at five o'clock. Never blue office light or a glowing laptop.
- **Grade:** blacks lifted slightly (no pure black), warm highlights, and greens pulled toward moss and olive, the way Minari's fields look. Skin tones are protected and never orange. One grade across every photo, so they feel like one film. Bake it into the files with a single LUT or curve in the image pipeline. Don't use CSS filters on the live page.
- **Greens:** green is our secondary colour and it comes from life: leaves in a window, a park canopy, the green of a Muni seat, a plant on a desk. Cubbon Park's canopy in Bengaluru and Golden Gate Park's in SF can be the visual rhyme between where we come from and where we're going.
- **Grain:** a fine 35 mm grain overlay across photographs (one tiny tiled noise texture, opacity 4–7%). It can flicker at 8–12 fps; it stays still under `prefers-reduced-motion`.
- **Subjects:** people in their own world. Someone reading on a train, hands on a notebook, a desk by a window with a plant, a bike on a hill, a kitchen table at night with one lamp on. Faces are allowed and often partly turned away. Never stock grins at the camera, handshakes, "diverse team at a whiteboard", code on screens or neon.
- **Framing:** full-bleed, cropped like film frames (2.39:1 on desktop heroes, 4:5 on mobile), with type set *on* the image the way A24 does it.

### Type
- **Display:** **Libre Caslon Display** (OFL, via `next/font/google`), large and tight, the way a title card is set. Use the italic only for names. A classic old-style serif reads "classic and classy" without a fashion-magazine feel. If the Scotch Deck licence from the India site is confirmed for web use, the designer may swap it in for continuity. Nothing else.
- **Text:** the system UI stack (`-apple-system, BlinkMacSystemFont` → SF Pro on Apple devices, which is what the India site uses and what SF engineers' Macs render) with **Inter** as the fallback. Don't self-host SF Pro.
- **Credits and labels:** **IBM Plex Mono** at 11–12 px, uppercase, wide tracking, used the way A24 uses its mono labels and the way film credits are set ("REPRESENTED BY TAL", "STEP 2 OF 4", "PHOTOGRAPH: NAME / UNSPLASH").
- Display is never smaller than 44 px on mobile or 96 px on desktop for the title frames. Body is 17–19 px with generous leading. Measure is 60–68 characters.

### Colour
- **Forest night** `#14261D`: the dark ground for the sections between photographs.
- **Moss** `#3F5B45`: the secondary green for rules, links on light, and the grade's shadow tint.
- **Linen** `#F6F1E7`: type on dark, and the paper of the letter. It's a warm off-white, not beige.
- **Ink** `#1C1B17`: type on paper.
- **Lamp** `#E3A13B`: one warm accent, like a lit window at night. It's used only for the main action and the one live moment (the found profile and the finished letter). Never decoration.
- **Banned:** grey text on beige, pure `#000` backgrounds, gradients and glows, ultramarine.

### Layout shapes
- Full-bleed photographic frames with type set on them.
- **The letter:** a single sheet of paper, centred, one column, slightly lifted off the dark ground, set like real correspondence (To, From, Subject, body, signature).
- Offset pairs: a large photo across 7 of 12 columns with a short passage across 4, staggered left and right as you scroll. Never three of them in a row at the same size.
- A **contact sheet**: a horizontal strip of real Bengaluru faces from the India site, like a photographer's proof sheet, with honest captions.
- **End credits:** a centred column of small mono and serif lines that scrolls up to the final action.
- **Forbidden:** equal four-column text grids, boxed 2×2s, dot fields or any abstract "network" visual, icon-feature cards, rows of pill chips, logo marquees (the India logos would imply US openings we don't have), and stat counters.

### Motion and interaction
- Film tempo, not app tempo. Things **fade up**, **push in** and **dissolve**. Nothing bounces.
- Title frames: a slow push-in on the photograph (scale 1.00 → 1.04 over 12 s, linear). The title fades up line by line (700 ms each, `cubic-bezier(0.22,1,0.36,1)`, 120 ms stagger).
- Section changes: 600–900 ms crossfades. Hovers: 250 ms `cubic-bezier(0.215,0.61,0.355,1)`. A photograph warms very slightly on hover (exposure +3%). Links get a hairline underline that draws from the left.
- **Your name as a title:** the display line follows the input keystroke by keystroke, with no animation lag. On first focus, it crossfades in from the placeholder.
- **The search:** honest progress in mono, driven by the real API stages (`search`, `people`, `profile`). No fake percentages and no spinner theatre.
- **"Is this you?":** the profile arrives like a print developing, opacity and slight blur clearing over 500 ms.
- **The letter types itself at a human pace**, word by word, with small pauses at commas and full stops (about 35 ms a character). The draft is already complete (the API doesn't stream), so this is presentation only. It finishes within 2.5 s whatever the length, and appears instantly under reduced motion.
- **The done frame:** a 1.2 s dissolve to the title card with their name. This is the only "big" moment, so earn it.
- One action is always within reach, as on Zero: after the hero on desktop, and as a slim bottom dock on mobile that reads "Ask Tal to represent you". It hides itself while the form is on screen.
- Use the normal cursor. No custom cursors, scroll-jacking or WebGL. Respect `prefers-reduced-motion` everywhere.

### Sound
- **Off by default.** One toggle, bottom-left, mono: "SOUND OFF" / "SOUND ON". The choice is remembered per viewer (wrapped in try/catch).
- When it's on: a quiet room-tone bed (a window open on a city street, distant birds, 20–30 s loop, ≤ 80 KB Opus), one soft felt-piano note when they say "Yes, that's me", and a short two-note phrase as the done title card appears. That's all.
- CC0 or original only, logged in ASSETS.md with the source URL. Volume ceiling is −24 LUFS. No sound plays before the toggle, ever.

---

## 6. Assets

### What we take from the India site (already in `public/india/`, logged in ASSETS.md)
- **People:** aman, ananya, aryan, isha, rohan, sanchit, souvik, sunny-shah. They're real Tal people in India. Use them in **one place**: the "Where we come from" contact sheet, captioned "People on Tal in Bengaluru". Never present them as SF members and never put quotes in their mouths. The only exception is a quote that already exists verbatim on the India site, with that person's real title, labelled Bengaluru.
- **The wordmark idea:** lowercase "tal". Set "tal" in the display serif for the US lockup, or use `misc/tal-boss-logo.svg` with "BOSS" dropped if the designer redraws it.
- **The chat-story pattern** from the India Select page: proof shown as a real exchange. Here it becomes the letter, and the email Tal sends you about a role.
- **The feeling** of the India home: light, airy and populated by real faces. Our dark sections must never feel heavy, and the photographs carry the air.
- **Not taken:** company logos (they imply US openings), the 4.7 laurel and stat rows, Inter-only headlines, and SF Pro font files.

### What we need (licensed or original, every one logged in ASSETS.md with URL, author and licence)
- **6–8 photographs from Unsplash or Pexels**, chosen to one brief:
  - SF morning fog over a street or hill;
  - a desk by a window with a plant, in afternoon light;
  - hands on a notebook or a coffee cup;
  - a person reading on a train or bus, face turned or partly visible;
  - a bike or a walk on a hill at golden hour;
  - Golden Gate Park and Cubbon Park canopies (the green rhyme);
  - one interior at night with a single lamp on (the "round the clock" frame).

  Grade all of them with one LUT. Credit every photographer in the end credits, by name.
- **One original photograph, if the founder can get it:** the Grapevine office in Bengaluru at night with the lights on, and no identifiable faces. (We don't put staff on the page; that's the founder's earlier decision.) It's the most honest "we work round the clock" image possible.
- **Sound:** one CC0 room tone (Freesound with the CC0 filter) and two piano notes, either CC0 or recorded by someone on the team on a phone.
- **Original:** the grain texture (generated), the LUT, and the OG image (the title card with "Talent" on a graded photo).
- **Never:** film stills, A24 posters or frames, anything from Minari, CODA or Amélie, AI-generated people, or stock "diverse office" clichés.

---

## 7. Page structure (top to bottom)

The flow's logic stays exactly as it is: name, company and title → LinkedIn found → "Is this you?" → the intro → resume (optional) → done. **The work-authorization question is gone** from the UI, the copy, the FAQ, previews and analytics.

0. **Top bar.** "tal" in the display serif on the left. On the right, in small text: "We have raised $7 million from Peak XV (formerly Sequoia Capital)." The sound toggle sits bottom-left, fixed.
1. **Opening frame.** A full-bleed graded photograph with *Talent* huge on it and the sentence under it. The first step of the form sits on a linen card at the lower right (desktop) or directly below the photo (mobile), with fields for full name, company and title. As the name is typed, it's set in the serif at the top of the card. Primary action: "Find me on LinkedIn". Secondary: "Paste my LinkedIn link instead".
2. **Finding you.** Inside the card, honest mono stages from the API. If it takes long: "This usually takes about 15 seconds." The rate-limit and daily-cap screens keep their honest copy and lead with "Paste my LinkedIn link".
3. **"Is this you?"** Their profile set like a casting card: name in the serif, headline and company in text. Actions: "Yes, that's me", "No, not me" (tries the next profile, up to three), and "Paste my link".
4. **The letter.** The card dissolves and the letter takes the centre of the screen on linen paper:
   - To: "A founder in San Francisco"; From: "Tal"; Subject: "Ana Ruiz, staff engineer at Stripe";
   - the two-sentence intro typed out;
   - the signature "Tal, a talent agent";
   - underneath, small: "This goes out only after you say yes to a role."
   - When `needsMore` is true, one question follows ("What's one thing you built that you're proud of?"), and their answer is woven in and highlighted once. "Looks good as it is" is the no-pressure exit.
5. **Your resume (optional).** "Want it sharper? Add your resume." It's a drop zone with no box, just a dashed hairline. The quiet alternative: "No resume handy? We'll work from your LinkedIn." That path asks for an email.
6. **Done: the title card.** A full-bleed graded photograph, their **name** in the display serif, and the credit line "REPRESENTED BY TAL · UNTIL 4 MAY 2027". Below it, three plain sentences: what happens next, where we'll write to them (the email we have), and that nobody hears their name until they say yes. No share buttons, no upsell.

Below the fold, for people who scroll before they start:

7. **What an agent does.** Three offset photo-and-passage pairs, staggered, each a short paragraph of prose (not a heading plus a blurb):
   - we read your work properly;
   - we look for the role and the person who makes the call;
   - we ask you before we say your name to anyone, and only then make the intro.
8. **The letter, shown once as a sample.** A real-looking intro on paper, clearly labelled "SAMPLE" in mono, for a fictional person whose name and company are obviously invented. Skip it if the hero letter is already on screen.
9. **Where we come from.** On forest night: Grapevine in Bengaluru, a million-plus professionals sharing real salaries, then Round1 placing engineers at India's fastest-growing AI companies, then Tal. Then the contact sheet of real Bengaluru faces. One number: 300,000+ tech professionals in the network, used once.
10. **The terms, as a letter of engagement.** Short paragraphs on paper, signed "The Tal team, Bengaluru":
    - free for you, and companies pay when they hire;
    - we ask before your name goes anywhere;
    - six months, with the exact date;
    - what we keep and how to have it deleted.
11. **Questions.** At most six, in plain words. No work-authorization question.
12. **End credits.** A centred column with the closing action ("Ask Tal to represent you"), "Made in Bengaluru by the team behind Grapevine", the photographers' names and sources, then Privacy, Terms, support@gvine.app and the funding line.

---

## 8. What "done" looks like, and how I'll judge it

**Done is when:**
- an AI engineer at Anthropic or OpenAI opens it on a laptop at night and stops at the first frame, before reading a word. Then they type their name, see it set like a title, and smile. Then they read the letter about themselves and think, "that's better than any recruiter has ever written about me." And they say, "wow, I should try this";
- the founder reads every line aloud and says "I can be proud of this";
- you can't mistake it for a template. Cover the logo, and it still couldn't be anyone else's site.

**How I'll judge it.** Demos, not memos. I'll use the real thing:
- on a laptop with sound on, at full screen;
- on a phone at 390 px, one-handed;
- with reduced motion turned on;
- end to end with the founder's own profile.

I'll look at the first frame for five seconds and say what I felt. Then I'll read every word aloud.

**It fails if any of these is true:**
- any v2 line or banned pattern returns (grep COPY.md and `content/site.ts` for "every time", "one job", "not … but", em dashes, "he/him/his" about Tal, and "Tal Select");
- any image, sound or font isn't in ASSETS.md with its licence;
- any person on the page could be read as a US member, or any quote isn't real and verbatim;
- work authorization appears anywhere: UI, copy, FAQ, previews, analytics or payload;
- a box grid, dot field, equal column row or logo strip appears;
- mobile Lighthouse performance is under 90, LCP is over 2.5 s on throttled 4G, CLS is over 0.02, or anything overflows at 390 px;
- sound plays before the toggle, or motion runs under reduced motion;
- every preview state (`/?preview=you|search|confirm|notFound|resume|noResume|sending|done|pitch`) doesn't render cleanly for review.
