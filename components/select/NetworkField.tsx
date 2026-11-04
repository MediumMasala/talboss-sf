"use client";

import { useEffect, useRef } from "react";
import { field, type FieldStep } from "./network-store";

/**
 * The Tal network, drawn to scale. Every dot is a fixed number of people and every hollow square a
 * fixed number of startups (the legend prints the exact ratio for this screen). The one blue point
 * is the visitor: it appears when they type their name, sends a sweep out while we search LinkedIn,
 * and draws its first intro lines when the application lands. Nothing here moves for decoration
 * alone: drift is slow and small, and everything else is driven by the real state of the form.
 *
 * Plain 2D canvas, one rAF loop, paused off-screen and in background tabs, static under reduced motion.
 */

type Props = { people: number; startups: number };

const PEOPLE_RATIOS = [25, 30, 40, 50, 60, 75, 100, 120, 150, 200, 250, 300, 500, 1000];
const STARTUP_RATIOS = [50, 100, 200, 250, 500];
const SIGNAL = "43, 60, 255"; // --signal
const INK = "14, 14, 12";
const DOT = "112, 107, 96";

type Mark = { bx: number; by: number; ph: number; w: number; amp: number; dim: number; order: number };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export function NetworkField({ people, startups }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    // Clearings and the "you" anchor live in the hero, outside the canvas host.
    const scope = host.closest<HTMLElement>(".hero") ?? host;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Dev preview screenshots skip the fill-in so headless captures show the finished field.
    const still = process.env.NODE_ENV === "development" && window.location.search.includes("preview=");
    let W = 0;
    let H = 0;
    let dpr = 1;
    let dots: Mark[] = [];
    let squares: Mark[] = [];
    let targets: number[] = [];
    let you = { x: 0, y: 0 };
    // Tal, the agent: sits between the visitor and the startups, and every intro line runs through him.
    let tal = { x: 0, y: 0 };
    let mono = "ui-monospace, monospace";
    let sansFamily = "system-ui, sans-serif";
    let pointer = { x: -9999, y: -9999 };
    let raf = 0;
    let visible = true;
    const born = performance.now();
    let stepAt = born;
    let lastStep: FieldStep = field.get().step;

    const layout = () => {
      const box = host.getBoundingClientRect();
      W = box.width;
      H = box.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pick the smallest honest ratio that keeps the field light enough for this screen.
      const budget = (W * H) / (W < 640 ? 72 : 115);
      const pr = PEOPLE_RATIOS.find((r) => people / r <= budget) ?? 1000;
      const nDots = Math.round(people / pr);
      const sr = STARTUP_RATIOS.find((r) => startups / r <= Math.max(18, nDots / 32)) ?? 500;
      const nSquares = Math.round(startups / sr);

      // Text and the form sit on clearings in the field.
      const avoid = Array.from(scope.querySelectorAll<HTMLElement>("[data-field-avoid]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - box.left - 14, t: r.top - box.top - 10, r: r.right - box.left + 14, b: r.bottom - box.top + 10 };
      });
      const dimAt = (x: number, y: number) => (avoid.some((a) => x > a.l && x < a.r && y > a.t && y < a.b) ? 0.14 : 1);

      const anchor = scope.querySelector<HTMLElement>("[data-field-you]")?.getBoundingClientRect();
      you = anchor
        ? { x: anchor.left - box.left + anchor.width / 2, y: anchor.top - box.top + anchor.height / 2 }
        : { x: W * 0.3, y: H * 0.7 };
      tal = {
        x: Math.min(W - 40, you.x + Math.min(210, W * 0.56)),
        y: you.y + (W < 640 ? 46 : -30),
      };

      // Communities: a few dense clusters plus a thin background, from a fixed seed so it never reshuffles.
      const r = rng(7);
      const K = 16;
      const clusters = Array.from({ length: K }, () => ({
        x: 0.03 + r() * 0.94,
        y: 0.04 + r() * 0.92,
        s: 0.025 + r() * 0.06,
        a: r() * Math.PI,
        k: 0.35 + r() * 0.65, // aspect: some communities are long filaments
        w: 0.4 + r(), // weight
      }));
      const total = clusters.reduce((n, c) => n + c.w, 0);
      const span = Math.max(W, H);
      const place = (): [number, number] => {
        if (r() < 0.16) return [r() * W, r() * H];
        let q = r() * total;
        const c = clusters.find((cl) => (q -= cl.w) <= 0) ?? clusters[0];
        const u = gauss(r) * c.s * span;
        const v = gauss(r) * c.s * span * c.k;
        return [c.x * W + u * Math.cos(c.a) - v * Math.sin(c.a), c.y * H + u * Math.sin(c.a) + v * Math.cos(c.a)];
      };
      const make = (n: number): Mark[] =>
        Array.from({ length: n }, () => {
          let [x, y] = place();
          x = Math.min(W - 2, Math.max(2, x));
          y = Math.min(H - 2, Math.max(2, y));
          return { bx: x, by: y, ph: r() * Math.PI * 2, w: 0.00012 + r() * 0.00022, amp: 1.5 + r() * 3.5, dim: dimAt(x, y), order: r() };
        });
      dots = make(nDots);
      squares = make(nSquares);
      // Keep a little air around the visitor's own point.
      for (const d of [...dots, ...squares]) {
        const dx = d.bx - you.x;
        const dy = d.by - you.y;
        const tx = d.bx - tal.x;
        const ty = d.by - tal.y;
        if (dx * dx + dy * dy < 22 * 22 || tx * tx + ty * ty < 20 * 20) d.dim = 0;
      }

      // Three visible startups at different angles become the first intros. A line may not cross text or the form.
      const clear = (x: number, y: number) => {
        for (let k = 1; k <= 14; k++) {
          const f = k / 14;
          if (dimAt(tal.x + (x - tal.x) * f, tal.y + (y - tal.y) * f) < 1) return false;
        }
        return x > 8 && x < W - 8 && y > 8 && y < H - 8;
      };
      const reach = Math.max(200, Math.min(W, H) * 0.42);
      const open = squares
        .map((sq, i) => ({ i, d: Math.hypot(sq.bx - tal.x, sq.by - tal.y), a: Math.atan2(sq.by - tal.y, sq.bx - tal.x) }))
        .filter((c) => Math.abs(Math.atan2(Math.sin(c.a - Math.atan2(you.y - tal.y, you.x - tal.x)), Math.cos(c.a - Math.atan2(you.y - tal.y, you.x - tal.x)))) > 1.1)
        .filter((c) => c.d > 60 && c.d < reach && clear(squares[c.i].bx, squares[c.i].by))
        .sort((a, b) => a.d - b.d);
      const chosen: { i: number; a: number }[] = [];
      const apart = (a: number) => chosen.every((c) => Math.abs(Math.atan2(Math.sin(a - c.a), Math.cos(a - c.a))) > 0.9);
      for (const c of open) {
        if (chosen.length === 3) break;
        if (apart(c.a)) chosen.push(c);
      }
      // Small screens leave little open field: seat the missing ones in the clearing around the visitor.
      const near = (a: number) => chosen.every((c) => Math.abs(Math.atan2(Math.sin(a - c.a), Math.cos(a - c.a))) > 0.42);
      for (let step = 0; chosen.length < 3 && step < 48; step++) {
        const a = -Math.PI + (step * Math.PI * 2) / 48 + 0.07;
        if (!near(a)) continue;
        const rad = Math.min(190, W * 0.48);
        if (Math.abs(Math.atan2(Math.sin(a - Math.atan2(you.y - tal.y, you.x - tal.x)), Math.cos(a - Math.atan2(you.y - tal.y, you.x - tal.x)))) < 1.1) continue;
        const x = tal.x + Math.cos(a) * rad * 0.6;
        const y = tal.y + Math.sin(a) * rad * 0.4;
        if (!clear(x, y)) continue;
        const i = squares.findIndex((_, k) => !chosen.some((c) => c.i === k) && squares[k].dim < 1);
        const k = i === -1 ? chosen.length : i;
        squares[k].bx = x;
        squares[k].by = y;
        squares[k].dim = 1;
        chosen.push({ i: k, a });
      }
      targets = chosen.map((c) => c.i);

      const probe = scope.querySelector<HTMLElement>(".font-mono");
      if (probe) mono = getComputedStyle(probe).fontFamily;
      sansFamily = getComputedStyle(scope).fontFamily || sansFamily;
      field.set({ scale: { people: pr, startups: sr } });
    };

    const pos = (m: Mark, t: number, motion: boolean) => {
      let x = m.bx;
      let y = m.by;
      if (motion) {
        x += Math.sin(t * m.w + m.ph) * m.amp;
        y += Math.cos(t * m.w * 0.8 + m.ph) * m.amp * 0.7;
      }
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d2 = dx * dx + dy * dy;
      let near = 0;
      if (d2 < 90 * 90) {
        const d = Math.sqrt(d2) || 1;
        near = 1 - d / 90;
        x += (dx / d) * near * 7;
        y += (dy / d) * near * 7;
      }
      return { x, y, near };
    };

    const draw = (now: number) => {
      const motion = !reduce.matches;
      const t = motion ? now : born + 4000;
      const { step, label } = field.get();
      if (step !== lastStep) {
        lastStep = step;
        stepAt = now;
      }
      const since = motion && !still ? now - stepAt : 4000;
      const intro = motion && !still ? ease((now - born) / 1500) : 1;

      ctx.clearRect(0, 0, W, H);

      // Search sweep: a ring leaves the visitor every 2.6 s while LinkedIn is being searched.
      const sweeping = step === "search";
      const R = Math.hypot(W, H) * 0.75;
      const ring = sweeping ? (motion ? ((now - stepAt) % 2600) / 2600 : 0.35) * R : -1;

      // People.
      const hot: { x: number; y: number; a: number; s: boolean }[] = [];
      ctx.beginPath();
      const faint: { x: number; y: number }[] = [];
      for (const d of dots) {
        if (d.order > intro || d.dim === 0) continue;
        const p = pos(d, t, motion);
        let s = 0;
        if (ring > 0) {
          const off = Math.abs(Math.hypot(p.x - tal.x, p.y - tal.y) - ring);
          if (off < 22) s = 1 - off / 22;
        }
        if (s > 0.05 || p.near > 0.05) hot.push({ x: p.x, y: p.y, a: Math.max(s, p.near) * d.dim, s: s > p.near });
        else if (d.dim < 1) faint.push(p);
        else ctx.rect(p.x - 0.7, p.y - 0.7, 1.4, 1.4);
      }
      ctx.fillStyle = `rgba(${DOT}, 0.62)`;
      ctx.fill();
      ctx.beginPath();
      for (const p of faint) ctx.rect(p.x - 0.7, p.y - 0.7, 1.4, 1.4);
      ctx.fillStyle = `rgba(${DOT}, 0.1)`;
      ctx.fill();
      for (const h of hot) {
        ctx.fillStyle = h.s ? `rgba(${SIGNAL}, ${0.35 + h.a * 0.65})` : `rgba(${INK}, ${0.5 + h.a * 0.5})`;
        const z = 1.6 + h.a * 1.2;
        ctx.fillRect(h.x - z / 2, h.y - z / 2, z, z);
      }

      if (ring > 0) {
        ctx.beginPath();
        ctx.arc(tal.x, tal.y, ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${SIGNAL}, ${0.22 * (1 - ring / R)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Startups: hollow squares.
      const intros = step === "resume" || step === "sending" || step === "done";
      const sq = squares.map((s) => (s.order > intro ? null : pos(s, t, motion)));
      ctx.lineWidth = 1;
      squares.forEach((s, i) => {
        const p = sq[i];
        if (!p || s.dim === 0) return;
        const isTarget = intros && targets.includes(i);
        if (isTarget) return;
        ctx.strokeStyle = `rgba(${INK}, ${(0.42 + p.near * 0.5) * s.dim})`;
        ctx.strokeRect(Math.round(p.x) - 2.5, Math.round(p.y) - 2.5, 5, 5);
      });

      // Tal, and the line that means "Tal represents you" (drawn once LinkedIn confirms who you are).
      {
        const linked = step === "confirm" || intros;
        if (linked) {
          ctx.beginPath();
          ctx.moveTo(you.x, you.y);
          ctx.lineTo(tal.x, tal.y);
          ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(${INK}, 0.75)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(tal.x, tal.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${INK})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tal.x, tal.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${INK}, 0.35)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = `600 13px ${sansFamily}`;
        const tw = ctx.measureText("Tal").width;
        const tx = Math.min(W - tw - 8, tal.x + 16);
        ctx.fillStyle = "rgba(244, 242, 236, 0.92)";
        ctx.fillRect(tx - 4, tal.y - 9, tw + 8, 18);
        ctx.fillStyle = `rgb(${INK})`;
        ctx.textBaseline = "middle";
        ctx.fillText("Tal", tx, tal.y + 0.5);
      }

      // The visitor.
      // The visitor's point is always there: an open ring that says "you" until they type a name.
      {
        // Intro lines to three startups.
        if (intros) {
          targets.forEach((ti, k) => {
            const p = sq[ti] ?? { x: squares[ti].bx, y: squares[ti].by };
            const grow = step === "done" ? ease((since - k * 180) / 900) : ease((since - k * 140) / 700);
            const ex = tal.x + (p.x - tal.x) * grow;
            const ey = tal.y + (p.y - tal.y) * grow;
            ctx.beginPath();
            ctx.moveTo(tal.x, tal.y);
            ctx.lineTo(ex, ey);
            if (step === "done") {
              // Possible intros, not sent ones: dashed and still, captioned in the hero.
              ctx.setLineDash([3, 4]);
              ctx.lineDashOffset = 0;
              ctx.strokeStyle = `rgba(${SIGNAL}, 0.7)`;
              ctx.lineWidth = 1.1;
            } else {
              ctx.setLineDash([2, 4]);
              ctx.lineDashOffset = motion ? -(now / (step === "sending" ? 25 : 70)) : 0;
              ctx.strokeStyle = `rgba(${SIGNAL}, 0.45)`;
              ctx.lineWidth = 1;
            }
            ctx.stroke();
            ctx.setLineDash([]);
            if (grow >= 1) {
              ctx.strokeStyle = `rgba(${SIGNAL}, 0.95)`;
              ctx.lineWidth = step === "done" ? 1.5 : 1;
              ctx.strokeRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6);
            }
          });
        }

        const appear = motion && !still ? ease((now - born - 700) / 600) : 1;
        // Halo.
        ctx.beginPath();
        // The ring breathes once on first paint, then holds still.
        const breath = motion && !still ? Math.sin(Math.PI * Math.min(1, Math.max(0, (now - born - 600) / 1500))) : 0;
        ctx.arc(you.x, you.y, 13 + breath * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${SIGNAL}, ${(0.5 - breath * 0.25) * appear})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(you.x, you.y, step === "you" ? 4 : 5, 0, Math.PI * 2);
        if (step === "you" && !label.trim()) {
          ctx.strokeStyle = `rgb(${SIGNAL})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = step === "you" ? `rgba(${SIGNAL}, ${0.8 * appear})` : `rgb(${SIGNAL})`;
          ctx.fill();
        }

        // Label, on a small paper chip so it reads over the dots.
        const text = (label.trim() || "you").slice(0, 32);
        ctx.font = `500 12px ${mono}`;
        const tw = ctx.measureText(text).width;
        const lx = Math.min(W - tw - 14, you.x + 18);
        const ly = you.y - 1;
        ctx.fillStyle = "rgba(244, 242, 236, 0.92)";
        ctx.fillRect(lx - 6, ly - 10, tw + 12, 20);
        ctx.fillStyle = `rgba(${SIGNAL}, ${appear})`;
        ctx.textBaseline = "middle";
        ctx.fillText(text, lx, ly + 0.5);
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden && !reduce.matches ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      // Paint now as well, so a frame exists even where rAF is throttled (background iframes, headless).
      draw(performance.now());
      if (!raf) raf = requestAnimationFrame(loop);
    };

    layout();
    kick();
    // If frames are throttled during the fill-in, still land on the finished field.
    const settle = setTimeout(kick, 1700);

    const ro = new ResizeObserver(() => {
      layout();
      kick();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      pointer = e.pointerType === "mouse" ? { x: e.clientX - b.left, y: e.clientY - b.top } : { x: -9999, y: -9999 };
      kick();
    };
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
      kick();
    };
    scope.addEventListener("pointermove", onMove);
    scope.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", kick);
    const unsub = field.subscribe(kick);
    // Webfont metrics shift the clearings slightly once fonts land.
    document.fonts?.ready.then(() => {
      layout();
      kick();
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      ro.disconnect();
      io.disconnect();
      scope.removeEventListener("pointermove", onMove);
      scope.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", kick);
      reduce.removeEventListener("change", kick);
      unsub();
    };
  }, [people, startups]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 size-full" />;
}
