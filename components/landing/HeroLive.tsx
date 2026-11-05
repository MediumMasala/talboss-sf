"use client";

import { useEffect, useRef, useState } from "react";
import * as C from "./heroLiveConfig";

/**
 * The hero motion, "the fog is thinking" (docs/team/HERO_DIRECTION.md §3). One WebGL canvas over the hero <img>, same
 * box, same object-cover maths, pointer-events none. It samples the still the <img> already decoded (no second
 * download, uploaded once per source) and does three things: the fog drifts downhill inside a luminance mask, one
 * light pulse every 10 s travels a hand-set path to the figure (the grass around them breathes on arrival), and
 * 24 fps film grain. One draw per held frame. Reduced motion, Save-Data, no WebGL or a lost context: no canvas, the
 * still alone. Every constant lives in heroLiveConfig.ts and is documented in docs/team/FRONTEND.md.
 */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

// GLSL ES 1.0 so one source runs on WebGL2 and WebGL1. Cost: two texture reads everywhere (plate + the low-res
// mask/bloom), the noise and the third read only inside the fog, the gaussians only near the light.
const FRAG = `precision highp float;
uniform sampler2D uTex;
uniform sampler2D uMask;  // r: the fog mask, a: the plate's bloom; built once from the still (low-res, smooth)
uniform sampler2D uNoise; // tileable value noise (r: two octaves, a: the warp), built once; x = one loop
uniform vec2 uRes;        // canvas, device px
uniform vec4 uCover;      // uv = fc * uCover.xy + uCover.zw (fc = device px, y down)
uniform float uAspect;    // image height / width
uniform float uLoop;      // 0..1 through the 30 s loop
uniform float uSeed;      // grain frame index
uniform vec2 uDir;        // drift direction (normalised)
uniform float uPeriod;    // drift travel per loop, p units
uniform vec4 uPulse;      // centre.xy, tangent.xy (p units)
uniform vec3 uPulseK;     // amp, sigma along, sigma across
uniform vec3 uBreath;     // end.xy, amp
uniform float uLive;      // 1 = effects on (0 = the plate exactly, 2 = the mask; dev checks)
const float CAP=${C.CAP.toFixed(5)};
const float DISP=${C.DISP_MAX.toFixed(5)};
const float DENS=${C.DENSITY.toFixed(4)};
const float WRAP=${C.NOISE_ACROSS_CELLS.toFixed(1)};
const float ACROSS=${C.NOISE_ACROSS.toFixed(4)};
const float PREL=${C.PULSE_REL.toFixed(4)};
const float PABS=${C.PULSE_ABS.toFixed(4)};
const float BSIG=${C.BREATH_SIGMA.toFixed(4)};
const float BREL=${C.BREATH_REL.toFixed(4)};
const float BABS=${C.BREATH_ABS.toFixed(4)};
const float BLOOM=${(C.BLOOM * (1 - C.BLOOM_FROM)).toFixed(5)};
const float GRAIN=${C.GRAIN.toFixed(4)};

float h12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}

void main(){
  vec2 fc=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 uv=fc*uCover.xy+uCover.zw;
  vec3 base=texture2D(uTex,uv).rgb;
  if(uLive<.5){gl_FragColor=vec4(base,1.);return;}
  vec2 p=vec2(uv.x,uv.y*uAspect);
  float l0=lum(base);
  vec4 mk=texture2D(uMask,uv);
  float m=mk.r;
  if(uLive>1.5){gl_FragColor=vec4(mix(base*.35,vec3(1.),m),1.);return;}  // dev: the fog mask over a dim plate
  vec3 col=base;
  if(m>.004){
    // The fog drifts: u runs downhill and wraps once per loop (the pattern travels uPeriod per loop); w runs across.
    vec2 perp=vec2(-uDir.y,uDir.x);
    float w=dot(p,perp)/ACROSS;
    float u=dot(p,uDir)/uPeriod-uLoop;
    float n2=texture2D(uNoise,vec2(u,w/WRAP+.37)).a;
    u+=.18*(n2-.5);                                    // domain warp, still periodic in u
    float n1=texture2D(uNoise,vec2(u,w/WRAP)).r;
    vec2 disp=(uDir*(n1-.5)*2.+perp*(n2-.5)*1.2)*DISP*m;
    col=texture2D(uTex,uv+vec2(disp.x,disp.y/uAspect)).rgb*(1.+m*DENS*(n1-.5)*2.);
  }
  float l=lum(col);
  float add=BLOOM*mk.a;
  // The pulse: a soft gaussian lift along the path's tangent.
  vec2 d=p-uPulse.xy;
  float a=dot(d,uPulse.zw)/uPulseK.y,b=dot(d,vec2(-uPulse.w,uPulse.z))/uPulseK.z;
  float q=a*a+b*b;
  if(uPulseK.x>0.&&q<18.) add+=uPulseK.x*exp(-.5*q)*(PREL*l+PABS);
  // The breath: the grass around the figure lifts on arrival.
  vec2 e=(p-uBreath.xy)/BSIG;
  float r=dot(e,e);
  if(uBreath.z>0.&&r<18.) add+=uBreath.z*exp(-.5*r)*(BREL*l+BABS);
  float hi=max(l0,CAP);
  // Film grain, luminance only, 1 device px, new every 1/24 s. Nothing added lifts a pixel past max(plate, 230).
  float g=(h12(gl_FragCoord.xy+uSeed*vec2(17.31,41.97))-.5)*2.*GRAIN;
  gl_FragColor=vec4(clamp(min(col+add,vec3(hi))+g,0.,hi),1.);
}`;

type Stats = { draws: number; cpuMs: number[]; rafMs: number[] };
type Gl = WebGLRenderingContext | WebGL2RenderingContext;

// Sine in-out: soft start and landing, but the light keeps moving until it reaches the figure (a cubic parks it
// at 99 % for the last second).
const easeInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A path in p units with its cumulative lengths, so a pulse can be placed by arc length. */
function prepare(path: C.Path, aspect: number) {
  const pts = path.map(([x, y]) => [x, y * aspect] as [number, number]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}
function at(pp: ReturnType<typeof prepare>, s: number) {
  const { pts, cum } = pp;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < s) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const f = Math.min(1, Math.max(0, (s - cum[i - 1]) / seg));
  const [x0, y0] = pts[i - 1];
  const [x1, y1] = pts[i];
  const tl = Math.hypot(x1 - x0, y1 - y0) || 1;
  return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, tx: (x1 - x0) / tl, ty: (y1 - y0) / tl };
}

/** Where the light is at time ts (seconds since first paint). Pure, so it can be checked from the console. */
export function timeline(ts: number) {
  const loopT = (((ts + C.PULSE_TRAVEL_S - C.FIRST_ARRIVAL_S) % C.LOOP_S) + C.LOOP_S) % C.LOOP_S;
  const slot = Math.floor(loopT / C.SLOT_S);
  const local = loopT - slot * C.SLOT_S;
  const x = local / C.PULSE_TRAVEL_S;
  const progress = x < 1 ? easeInOut(x) : 1;
  const pulse = x < 1 ? smooth(0, C.PULSE_IN, x) * (1 - smooth(1 - C.PULSE_OUT, 1, x)) : 0;
  const bx = (local - (C.PULSE_TRAVEL_S - C.BREATH_LEAD_S)) / C.BREATH_S;
  const breath = bx > 0 && bx < 1 ? Math.pow(Math.sin(Math.PI * bx), 2) : 0;
  return { loopT, slot, local, progress, pulse, breath };
}

/** "50% 100%" / "center bottom" / "50%" → fractions (keywords and percentages; anything else falls back to centre). */
function objectPos(v: string): [number, number] {
  const k: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
  const parts = (v || "50% 50%").trim().split(/\s+/);
  const f = (t: string | undefined) => (t == null ? 0.5 : t in k ? k[t] : t.endsWith("%") ? parseFloat(t) / 100 : 0.5);
  if (parts.length === 1) return [f(parts[0]), 0.5];
  const [a, b] = parts;
  if (a === "top" || a === "bottom" || b === "left" || b === "right") return [f(b), f(a)];
  return [f(a), f(b)];
}

function firstPaint() {
  const e = performance.getEntriesByType("paint").find((p) => p.name === "first-paint" || p.name === "first-contentful-paint");
  return e ? e.startTime : performance.now();
}

export function HeroLive() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [off, setOff] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const img = canvas?.parentElement?.querySelector<HTMLImageElement>("img.hero-img");
    const art = canvas?.parentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!canvas || !img || !art || reduce.matches || save) {
      setOff(true);
      return;
    }
    // The canvas shares .hero-img's entrance scale; pin its clock to the image's so both move as one.
    const sync = () => {
      const ia = img.getAnimations()[0];
      for (const a of canvas.getAnimations()) if (ia && ia.startTime != null) a.startTime = ia.startTime;
    };
    sync();

    let gl: Gl | null = null;
    let raf = 0;
    let alive = true;
    let visible = true;
    let lastFrame = -1;
    let shown = false;
    let shownAt = -1;
    const t0 = firstPaint();
    const stats: Stats = { draws: 0, cpuMs: [], rafMs: [] };
    let lastRaf = 0;
    let live = 1;
    let crop: C.Crop = "16x9";
    let aspect = 9 / 16;
    let paths: ReturnType<typeof prepare>[] = [];
    let iw = 1;
    let ih = 1;
    const U: Record<string, WebGLUniformLocation | null> = {};
    let isGl2 = false;
    let maskTex: WebGLTexture | null = null;
    let tex: WebGLTexture | null = null;

    // The fog mask and the bloom (once per source): the still drawn at MASK_W px; r = luminance keyed into the fog
    // band, a = how far the plate is above 200/255; each box-blurred twice so both are smooth.
    const buildMask = (f: C.FogMask) => {
      if (!gl) return;
      const mw = C.MASK_W;
      const mh = Math.max(1, Math.round(mw * aspect));
      const cv = document.createElement("canvas");
      cv.width = mw;
      cv.height = mh;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, mw, mh);
      const px = ctx.getImageData(0, 0, mw, mh).data;
      const fig = C.FIGURE[crop];
      const m = new Float32Array(mw * mh);
      const bl = new Float32Array(mw * mh);
      for (let y = 0; y < mh; y++) {
        const v = (y + 0.5) / mh;
        const band = smooth(f.top - f.feather, f.top, v) * (1 - smooth(f.bottom, f.bottom + f.feather, v));
        for (let x = 0; x < mw; x++) {
          const k = (y * mw + x) * 4;
          const l = (0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]) / 255;
          // The person never moves: the mask is zero inside the FIGURE box (and feathered around it). Distance to the
          // box in p units (fractions of the width).
          const dx = Math.max(fig.x0 - (x + 0.5) / mw, 0, (x + 0.5) / mw - fig.x1);
          const dy = Math.max(fig.y0 - (y + 0.5) / mh, 0, (y + 0.5) / mh - fig.y1) * aspect;
          const hole = smooth(0, C.FIGURE_FEATHER, Math.hypot(dx, dy));
          m[y * mw + x] = smooth(f.lumLo, f.lumHi, l) * band * hole;
          bl[y * mw + x] = Math.max(0, l - C.BLOOM_FROM) / (1 - C.BLOOM_FROM);
        }
      }
      const blur = (src: Float32Array, r: number) => {
        let cur = src;
        for (let pass = 0; pass < 2; pass++) {
          const t = new Float32Array(mw * mh);
          for (let y = 0; y < mh; y++)
            for (let x = 0; x < mw; x++) {
              let s = 0;
              for (let i = -r; i <= r; i++) s += cur[y * mw + Math.min(mw - 1, Math.max(0, x + i))];
              t[y * mw + x] = s / (2 * r + 1);
            }
          const o = new Float32Array(mw * mh);
          for (let y = 0; y < mh; y++)
            for (let x = 0; x < mw; x++) {
              let s = 0;
              for (let i = -r; i <= r; i++) s += t[Math.min(mh - 1, Math.max(0, y + i)) * mw + x];
              o[y * mw + x] = s / (2 * r + 1);
            }
          cur = o;
        }
        return cur;
      };
      const mm = blur(m, C.MASK_BLUR);
      const bb = blur(bl, C.BLOOM_BLUR);
      const bytes = new Uint8Array(mw * mh * 2);
      for (let i = 0; i < mw * mh; i++) {
        bytes[i * 2] = Math.round(Math.min(1, mm[i]) * 255);
        bytes[i * 2 + 1] = Math.round(Math.min(1, bb[i]) * 255);
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, mw, mh, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.activeTexture(gl.TEXTURE0);
    };

    // Tileable value noise, NOISE_TEX px square, REPEAT in both axes (power of two, so WebGL1 can repeat it). x is one
    // loop period with NOISE_CELLS cells per octave; y wraps every NOISE_ACROSS_CELLS cells. r = 0.65 × octave 1 +
    // 0.35 × octave 2; a = an independent octave-1 field (the across push and the domain warp). Uploaded once.
    const buildNoise = () => {
      if (!gl) return;
      const n = C.NOISE_TEX;
      const hash = (x: number, y: number, s: number) => {
        let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
      };
      const vn = (x: number, y: number, cx: number, cy: number, s: number) => {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        let fx = x - ix;
        let fy = y - iy;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        const x0 = ((ix % cx) + cx) % cx;
        const x1 = (x0 + 1) % cx;
        const y0 = ((iy % cy) + cy) % cy;
        const y1 = (y0 + 1) % cy;
        const a = hash(x0, y0, s) + (hash(x1, y0, s) - hash(x0, y0, s)) * fx;
        const b = hash(x0, y1, s) + (hash(x1, y1, s) - hash(x0, y1, s)) * fx;
        return a + (b - a) * fy;
      };
      const [c1, c2] = C.NOISE_CELLS;
      const w1 = C.NOISE_ACROSS_CELLS;
      const bytes = new Uint8Array(n * n * 2);
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const u = x / n;
          const v = y / n;
          const r = 0.65 * vn(u * c1, v * w1, c1, w1, 1) + 0.35 * vn(u * c2, v * w1 * 2, c2, w1 * 2, 2);
          const a = vn(u * c1, v * w1, c1, w1, 3);
          bytes[(y * n + x) * 2] = Math.round(r * 255);
          bytes[(y * n + x) * 2 + 1] = Math.round(a * 255);
        }
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, n, n, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(U.uNoise, 2);
      gl.activeTexture(gl.TEXTURE0);
    };

    const kill = () => {
      alive = false;
      cancelAnimationFrame(raf);
      art.classList.remove("is-live");
      setOff(true);
    };

    const init = () => {
      const opts: WebGLContextAttributes = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" };
      gl = (canvas.getContext("webgl2", opts) as WebGL2RenderingContext | null) ?? (canvas.getContext("webgl", opts) as WebGLRenderingContext | null);
      if (!gl) return false;
      isGl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      const sh = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          if (process.env.NODE_ENV !== "production") console.warn("[HeroLive]", gl!.getShaderInfoLog(s));
          return null;
        }
        return s;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ["uTex", "uRes", "uCover", "uAspect", "uLoop", "uSeed", "uDir", "uPeriod", "uMask", "uNoise", "uPulse", "uPulseK", "uBreath", "uLive"])
        U[n] = gl.getUniformLocation(prog, n);
      tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(U.uTex, 0);
      maskTex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.uniform1i(U.uMask, 1);
      buildNoise();
      gl.activeTexture(gl.TEXTURE0);
      const dx = C.DRIFT_DIR[0];
      const dy = C.DRIFT_DIR[1];
      const dl = Math.hypot(dx, dy);
      gl.uniform2f(U.uDir, dx / dl, dy / dl);
      return true;
    };

    // Upload the still the <img> shows (once per source; a breakpoint swap fires 'load' again).
    const upload = () => {
      if (!gl || !img.naturalWidth) return false;
      iw = img.naturalWidth;
      ih = img.naturalHeight;
      aspect = ih / iw;
      crop = /4x5/.test(img.currentSrc) || iw / ih < 1.2 ? "4x5" : "16x9";
      paths = C.PATHS[crop].map((p) => prepare(p, aspect));
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      buildMask(C.FOG[crop]);
      gl.uniform1f(U.uAspect, aspect);
      size();
      lastFrame = -1;
      return true;
    };

    // Canvas backing store = its CSS box × DPR (≤ 2); object-cover maths as uniforms.
    const size = () => {
      if (!gl) return;
      const dpr = Math.min(devicePixelRatio || 1, C.DPR_MAX);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
      const s = Math.max(w / iw, h / ih);
      const dw = iw * s;
      const dh = ih * s;
      // The img's own object-position (the desktop plate is anchored to the bottom), so the canvas lands on it exactly.
      const [ax, ay] = objectPos(getComputedStyle(img).objectPosition);
      gl.uniform4f(U.uCover, 1 / dw, 1 / dh, (-(w - dw) * ax) / dw, (-(h - dh) * ay) / dh);
      // The drift is DRIFT_PX_S CSS px/s at any width: one loop travels DRIFT_PX_S × 30 px of the drawn image.
      gl.uniform1f(U.uPeriod, (C.DRIFT_PX_S * C.LOOP_S) / (dw / dpr));
      lastFrame = -1;
    };

    const draw = (ts: number) => {
      if (!gl || !paths.length) return;
      const c0 = performance.now();
      const tl = timeline(ts);
      const pp = paths[tl.slot % paths.length];
      const pt = at(pp, tl.progress * pp.len);
      const end = pp.pts[pp.pts.length - 1];
      gl.uniform1f(U.uLoop, tl.loopT / C.LOOP_S);
      gl.uniform1f(U.uSeed, Math.floor(ts * C.FPS) % (C.LOOP_S * C.FPS));
      gl.uniform4f(U.uPulse, pt.x, pt.y, pt.tx, pt.ty);
      gl.uniform3f(U.uPulseK, tl.pulse, Math.max(1e-4, C.PULSE_LEN * pp.len), C.PULSE_ACROSS);
      gl.uniform3f(U.uBreath, end[0], end[1], tl.breath);
      gl.uniform1f(U.uLive, live);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      stats.draws++;
      stats.cpuMs.push(performance.now() - c0);
      if (stats.cpuMs.length > 600) stats.cpuMs.shift();
    };

    const tick = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (lastRaf) {
        stats.rafMs.push(now - lastRaf);
        if (stats.rafMs.length > 600) stats.rafMs.shift();
      }
      lastRaf = now;
      const ts = (performance.now() - t0) / 1000;
      const frame = Math.floor(ts * C.FPS);
      if (frame === lastFrame) return; // hold the frame: film cadence
      lastFrame = frame;
      draw(ts);
      if (!shown) {
        shown = true;
        shownAt = ts;
        canvas.style.opacity = "1";
        // The shader's grain replaces the CSS grain once the canvas is fully in.
        setTimeout(() => alive && art.classList.add("is-live"), C.FADE_MS);
      }
    };

    const run = () => {
      cancelAnimationFrame(raf);
      lastRaf = 0;
      if (alive && visible && !document.hidden && gl) raf = requestAnimationFrame(tick);
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      kill();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    const ro = new ResizeObserver(() => size());
    const onVis = () => run();
    const onLoad = () => {
      if (upload()) run();
    };
    const onReduce = () => reduce.matches && kill();
    reduce.addEventListener("change", onReduce);

    // Start after load and idle, so nothing here competes with the LCP image or hydration.
    let idle = 0;
    const start = () => {
      if (!alive) return;
      const go = async () => {
        if (!alive) return;
        try {
          await img.decode();
        } catch {}
        if (!alive) return;
        if (!init() || !upload()) return kill();
        img.addEventListener("load", onLoad);
        io.observe(canvas);
        ro.observe(canvas);
        document.addEventListener("visibilitychange", onVis);
        run();
      };
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) idle = ric(() => void go(), { timeout: 600 });
      else idle = window.setTimeout(() => void go(), 50);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    if (process.env.NODE_ENV !== "production") {
      const pct = (a: number[], q: number) => {
        const s = [...a].sort((x, y) => x - y);
        return +(s[Math.min(s.length - 1, Math.floor(q * s.length))] ?? 0).toFixed(3);
      };
      (window as unknown as { __heroLive: unknown }).__heroLive = {
        timeline,
        get shownAt() {
          return { shownAt, firstPaintMs: t0 };
        },
        get t() {
          return (performance.now() - t0) / 1000;
        },
        get crop() {
          return { crop, iw, ih, src: img.currentSrc, gl2: isGl2, w: canvas.width, h: canvas.height };
        },
        /** true = effects, false = the plate exactly, "mask" = the fog mask over a dim plate. */
        live(on: boolean | "mask") {
          live = on === "mask" ? 2 : on ? 1 : 0;
          lastFrame = -1;
        },
        stats() {
          const r = stats.rafMs.slice(-300);
          const c = stats.cpuMs.slice(-300);
          return { draws: stats.draws, raf: { n: r.length, p50: pct(r, 0.5), p95: pct(r, 0.95), max: pct(r, 1) }, cpu: { p50: pct(c, 0.5), p95: pct(c, 0.95), max: pct(c, 1) } };
        },
        /** n synchronous draws, each finished with gl.finish(): an upper bound on GPU time per frame. */
        bench(n = 300, at?: number) {
          if (!gl) return null;
          const ms: number[] = [];
          for (let i = 0; i < n; i++) {
            const t = at ?? (performance.now() - t0) / 1000 + i / C.FPS;
            const a = performance.now();
            draw(t);
            gl.finish();
            ms.push(performance.now() - a);
          }
          lastFrame = -1;
          return { n, p50: pct(ms, 0.5), p95: pct(ms, 0.95), max: pct(ms, 1), w: canvas.width, h: canvas.height };
        },
        /** GPU time per draw from EXT_disjoint_timer_query_webgl2 (WebGL2 only), n frames spread over the loop. */
        async gpu(n = 300) {
          const g = gl as WebGL2RenderingContext | null;
          const ext = g && isGl2 ? g.getExtension("EXT_disjoint_timer_query_webgl2") : null;
          if (!g || !ext) return null;
          const ms: number[] = [];
          for (let i = 0; i < n; i++) {
            const q = g.createQuery()!;
            g.beginQuery(ext.TIME_ELAPSED_EXT, q);
            draw((i * C.LOOP_S) / n);
            g.endQuery(ext.TIME_ELAPSED_EXT);
            for (let k = 0; k < 400 && !g.getQueryParameter(q, g.QUERY_RESULT_AVAILABLE); k++) await new Promise((r) => setTimeout(r, 1));
            if (!g.getParameter(ext.GPU_DISJOINT_EXT)) ms.push(g.getQueryParameter(q, g.QUERY_RESULT) / 1e6);
            g.deleteQuery(q);
          }
          lastFrame = -1;
          return { n: ms.length, p50: pct(ms, 0.5), p95: pct(ms, 0.95), max: pct(ms, 1), w: canvas.width, h: canvas.height };
        },
        /** Draw time ts and read the canvas back (device px), for seam and contrast checks. */
        read(ts: number, x: number, y: number, w: number, h: number) {
          if (!gl) return null;
          draw(ts);
          const out = new Uint8Array(w * h * 4);
          gl.readPixels(x, canvas.height - y - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, out);
          lastFrame = -1;
          return out;
        },
        pause() {
          alive = false;
          cancelAnimationFrame(raf);
        },
      };
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idle);
      window.removeEventListener("load", start);
      reduce.removeEventListener("change", onReduce);
      img.removeEventListener("load", onLoad);
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      art.classList.remove("is-live");
    };
  }, []);

  if (off) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="hero-img hero-live pointer-events-none absolute inset-x-0 top-0 h-[480px] w-full md:h-full"
      style={{ opacity: 0, transition: `opacity ${C.FADE_MS}ms ease-out` }}
    />
  );
}
