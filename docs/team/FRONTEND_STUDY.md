# Frontend study (v4.1, 4 Nov 2026)

Measured in Chrome at 1470 × 801 (desktop), in my own tab. Method: `document.getAnimations()` read while scrolling the page in 400–700 px steps (name, duration, the keyframe easing, delay, animated properties); computed `transition-*` on every element, grouped and counted; for interactions, `requestAnimationFrame` sampling of the moving element's `getBoundingClientRect()` after a scripted click. No logins, no forms. Everything below is a measured number unless marked "read".

## What each site does, in numbers

### jackandjill.ai (light, serif headline, Next.js, no Lenis, no GSAP)
- Hero headline: 72/87.8, tracking −1.8 px (−0.025 em), weight 400 serif ("marist").
- **Headline letter cascade:** every letter is its own CSS animation, 720 ms, keyframe easing `cubic-bezier(0.4, 0, 0.2, 1)`, `translateY(-7.2px) → 0` + opacity 0 → 1, **14 ms stagger** (delays 90, 104, 118 …). A second variant ("-magic") also animates colour.
- "Series A" announcement: width reveal 1000 ms with `cubic-bezier(0.7, 0, 0.3, 1)` and a hold to 40 %; a caret rides the edge; highlight fades in 280 ms `ease` at 1275 ms.
- Segmented toggle (Candidates / Companies): 400 ms `cubic-bezier(0.7, 0, 0.3, 1)`. Sampled: thumb x 616 → 730 px, 17 % of the way at 128 ms, 90 % at 277 ms, settled by 330 ms. A strong ease-in-out; it reads as "deliberate", not springy.
- Stats: live counters that tick (6,394 → 6,395 seen over 4 s), digits "hop" in with `cubic-bezier(0.18, 0.86, 0.28, 1.12)` 460–505 ms: an overshoot curve.
- A logo strip (static row of 8) and an orbit of photos at 96 s per turn, linear, infinite.
- Hovers: colour/background 150 ms `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind default) on 35+ elements; opacity 320 ms `cubic-bezier(0.26, 0.08, 0.25, 1)`.
- Takeaway: the "charm" is micro-typography (per-letter, 14 ms) and numbers that are alive. Product mock (their own app UI) is the hero proof.

### meetdex.ai (warm off-white, Next.js, two WebGL canvases)
- H1 60/66, −1.5 px (−0.025 em), weight 600 grotesk.
- **Hero choreography:** landscape fades 650 ms; headline 1000 ms at +350 ms with `translateY(16.8px) → 0`, `blur(8px) → 0`, opacity 0 → 1; product card 1000 ms at +850 ms, `translateY(4.48px) → 0`. All `cubic-bezier(0.25, 0.1, 0.25, 1)` (CSS `ease`).
- Feature reveals 550 ms `cubic-bezier(0.23, 1, 0.32, 1)` (easeOutQuint) with transform + filter + opacity; list rows "new-roles-block-in" animate height + box-shadow (layout-ish).
- Uses **CSS scroll-driven animations** (`scroll-fade-reveal-*` on a `ScrollTimeline`) for edge fades on scrollers. No JS scroll lib.
- Canvas: 2910 × 2275 WebGL dither (halftone) landscape, colour bleeds in; runs at 62 rAF/s.
- Hover/focus: 150 ms `cubic-bezier(0.4, 0, 0.2, 1)`, transform 200–400 ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Takeaway: blur-in headline + delayed product card is the exact entry we beat; the dither art gives them "soul". Their logo wall is static.

### why.zero.university (WebGL experience, virtual scroll, page height = viewport)
- Preloader counts 0 → 100; then a gesture gate: **draw a circle** ("DRAW ZERO") on a canvas to enter (I drew it with scripted pointer events; a white bloom, then "You Believed").
- Scroll scrubs a 3D scene (hand, cards); persistent bottom dock: avatar + black pill "Join Beta" + menu. XP counter top right (gamified).
- UI transitions: `transform 320–380 ms cubic-bezier(0.22, 1, 0.36, 1)`; background 400 ms `ease` on 134 elements; HUD shimmer 9 s linear.
- Takeaway: one persistent CTA dock, and an interaction that asks something of you. Too heavy for our budget (Lighthouse 95); we take the dock and the "it reacts to you" idea, not WebGL.

### linear.app (near-black #08090A, Inter Variable)
- H1 64/64, −1.408 px (−0.022 em), weight 510.
- Dominant hover: `color 100 ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` (216 elements). Panels `transform 700 ms cubic-bezier(0.32, 0.72, 0, 1)` (the iOS sheet curve) on 20 elements.
- Reveals use **`linear()` spring easings** (a 300 ms opacity with a 29-stop `linear(0, 0.0411 3.4 %, 0.1342 6.9 % …)` curve), i.e. Motion-generated springs compiled to CSS.
- Grid-dot ambient animations, `steps(1)`, 2800 ms. Product mock is the hero, under the headline, full width.
- Takeaway: everything is fast (100 ms colour) except big surfaces (700 ms sheet curve). Contrast in tempo = quality.

### vercel.com (light)
- H1 64/64, −3.84 px (−0.06 em), weight 400.
- Transitions: 100–150 ms `cubic-bezier(0.4, 0, 0.2, 1)`; reveal transform 700 ms `cubic-bezier(0.5, 0.25, 0.35, 1)` + opacity 1000 ms `ease`.
- Logo row under the hero (OpenAI, SpaceX …), monochrome. Consent banner left untouched.

### stripe.com
- 12 canvases (the WebGL gradient and globe).
- House easing **`cubic-bezier(0.25, 1, 0.5, 1)` 300 ms** (easeOutQuart) for colour, fill, stroke, transform and opacity (150+ elements each). Long reveals `transform 800 ms cubic-bezier(0.165, 0.84, 0.44, 1)` (easeOutQuart, 46 elements). Section transitions 1420 ms `cubic-bezier(0.78, 0, 0.22, 1)` with clip-path.
- Takeaway: one house curve used everywhere is what makes it feel "of a piece".

### lusion.co (studio, WebGL, virtual scroll)
- Easing vocabulary: `cubic-bezier(0.4, 0, 0.1, 1)` and `cubic-bezier(0.35, 0, 0, 1)` at 300–600 ms on transforms: a very sharp expo-out (fast start, long soft landing).
- 3 canvases; html class `is-desktop is-ready`. Pointer drives the 3D scene.

### tal-boss-web.vercel.app (ours, India)
- H1 92/105.8, weight 600, SF Pro Display (self-hosted there; we must not ship it).
- House easing **`cubic-bezier(0.16, 1, 0.3, 1)`** (easeOutExpo): button scale/translate 160 ms, reveals 280 ms, portraits appear 800 ms, orbit settles 3200 ms; orbit turns 90 s / 180 s linear; portrait cycles 10 s ease-in-out with 370 ms offsets.
- The Tal Boss / Tal Select pill toggle swaps the whole page to the dark Select landing (chat card, "handpicked talent" in silver).
- **Silver pill CTA** on the dark page: `linear-gradient(#FFFFFF, #D9DCE2 55%, #A9AEB8)`, `inset 0 -3px 6px rgba(138,143,153,.5), inset 0 1px 0 #fff`, radius 999, height 60. That is our metallic language; we reuse it.

## The motion system I'm building with (decided from the above)

| token | value | used for | why |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | reveals, screen enters, chips | our own India site's curve; close to Linear/Zero/Lusion expo-outs |
| `--ease-io` | `cubic-bezier(0.7, 0, 0.3, 1)` | progress fills, accordion, segmented moves | J&J's deliberate in-out for things that travel |
| `--ease-hover` | `cubic-bezier(0.25, 1, 0.5, 1)` | colour/background on hover | Stripe's house curve |
| spring `snap` | stiffness 420, damping 34 | magnetic buttons, profile card spring-in | settles in ~350 ms, 1 small overshoot |
| spring `travel` | stiffness 260, damping 30 | shared-layout text travel between screens | ~500 ms, no visible overshoot on text |
| hover | 120 ms | colour | Linear 100 ms, Stripe 300 ms: middle |
| screen enter | 520 ms, y 16 → 0, blur 6 → 0 | flow screens | Dex's blur-in, shorter |
| letter cascade | 32 ms stagger, 600 ms each | the name on Done | J&J does 14 ms on a long headline; a name is short, so slower |

Rules taken from the study: transform and opacity only (filter blur only on entry, never on scroll); tempo contrast (UI 100–160 ms, surfaces 500–700 ms); one ambient loop per screen at most; product UI as proof (Linear, Dex, J&J all show their app above the fold).

## Libraries, read from the docs
- **Motion (`framer-motion` 14.9 here, the same engine as motion v12):** `layoutId` animates a new element out of the old one's last box (shared element); `layout` uses transforms (translate + scale) and counter-scales children marked `layout`; `layout="position"` animates position only when aspect changes. `LayoutGroup` syncs layout across siblings. `AnimatePresence mode="popLayout"` pulls the exiting child out of flow so the entering one and any shared `layoutId` element move together. `useScroll({ target, offset: ["start end", "end start"] })` returns `scrollYProgress` (uses `ScrollTimeline` where it can, hardware-accelerated for transform/opacity/clipPath/filter); pair with `useTransform` and `useSpring`. LazyMotion: `domAnimation` (animations, variants, exit, gestures) vs `domMax` (adds layout + drag). I load `domMax` only on the flow route.
- **Lenis 1.3.27** (`lenis`, `lenis/react` → `ReactLenis`; css `lenis/dist/lenis.css`): `lerp 0.1` default, `smoothWheel: true`, `syncTouch: false` by default, so touch stays native, which is what we want; honours `prefers-reduced-motion` (no smoothing, instant programmatic scroll). A few KB, no deps.
- **View Transitions API:** `document.startViewTransition(cb)` snapshots old/new and crossfades; per-element `view-transition-name` morphs. Not used: Motion's `layoutId` does the text travel inside one React tree with springs, and Next 16's view-transition integration is still experimental. The landing-to-flow handoff uses a clip-path circle wipe instead (works everywhere, one element).
- **GSAP ScrollTrigger:** not needed; `useScroll` + `whileInView` cover pinning-free scroll effects. Not installed.

## What we do better than Dex and Jack & Jill (the bar)
1. The name you type physically travels: input → answer trail → the profile card → your name on the Done screen.
2. Honest progress tied to the real `/api/linkedin/poll` stage, not a fake timer.
3. A wordmark that is metal: a sheen that follows your pointer.
4. Numbers that count up once, on view; a chat that types itself with real pauses.
5. 60 fps on transform/opacity, Lighthouse ≥ 95 on mobile; both competitors ship heavier canvases.
