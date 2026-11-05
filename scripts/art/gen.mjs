#!/usr/bin/env node
// Original-art generator for the Tal US site (Gemini image model, no deps beyond sharp for PNG re-encode).
//
// Usage:
//   node scripts/art/gen.mjs <jobs.json> <outDir> [--model gemini-3-pro-image] [--size 2K|4K]
//                            [--concurrency 4] [--force]
//
// jobs.json = [{ "name": "fog-a-16x9", "aspect": "16:9", "prompt": "...",
//                "size": "4K",              // optional, overrides --size (imageConfig.imageSize)
//                "ref": "path/to/ref.png"   // optional reference image(s): a path or an array of paths
//              }, ...]
// Writes <outDir>/<name>.png and appends "<name> ok|FAIL <reason>" to <outDir>/log.txt.
// Skips files that already exist unless --force. Retries 429/5xx and empty responses.
//
// Model: --model, else ART_MODEL, else gemini-3.1-flash-image. imageSize is only sent when given
// (gemini-3-pro-image supports "1K" | "2K" | "4K").
//
// The key is read from GEMINI_API_KEY in .dev.vars (gitignored) or the environment.
// It is sent only in the x-goog-api-key header and is never printed or logged.

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const p = join(ROOT, ".dev.vars");
  if (!existsSync(p)) throw new Error(".dev.vars not found");
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*GEMINI_API_KEY\s*=\s*"?([^"\s]+)"?\s*$/);
    if (m) return m[1];
  }
  throw new Error("GEMINI_API_KEY missing from .dev.vars");
}

const args = process.argv.slice(2);
const jobsPath = args[0];
const outDir = args[1];
if (!jobsPath || !outDir) {
  console.error("usage: node scripts/art/gen.mjs <jobs.json> <outDir> [--model M] [--size 2K|4K] [--concurrency N] [--force]");
  process.exit(2);
}
const flag = (name) => { const k = args.indexOf(name); return k > -1 ? args[k + 1] : undefined; };
const MODEL = flag("--model") || process.env.ART_MODEL || "gemini-3.1-flash-image";
const SIZE = flag("--size");
const CONC = Number(flag("--concurrency") || 4);
const FORCE = args.includes("--force");
const KEY = loadKey();
const jobs = JSON.parse(readFileSync(jobsPath, "utf8"));
mkdirSync(outDir, { recursive: true });
const logPath = join(outDir, "log.txt");
const log = (s) => { appendFileSync(logPath, s + "\n"); console.log(s); };

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
function refParts(job) {
  const refs = job.ref ? (Array.isArray(job.ref) ? job.ref : [job.ref]) : [];
  return refs.map((p) => {
    const abs = resolve(ROOT, p);
    return { inlineData: { mimeType: MIME[extname(abs).toLowerCase()] || "image/png", data: readFileSync(abs).toString("base64") } };
  });
}

async function generate(job, attempt = 1) {
  const imageConfig = { aspectRatio: job.aspect };
  const size = job.size || SIZE;
  if (size) imageConfig.imageSize = size;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [...refParts(job), { text: job.prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig },
      }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 4000 * attempt));
      return generate(job, attempt + 1);
    }
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 160).replace(/\s+/g, " ")}`);
  }
  const data = JSON.parse(text);
  const parts = data?.candidates?.[0]?.content?.parts || [];
  // Thinking models can return draft images flagged `thought`; keep the last final one.
  const imgs = parts.filter((p) => p.inlineData?.data && !p.thought);
  const img = imgs[imgs.length - 1];
  if (!img) {
    if (attempt < 3) return generate(job, attempt + 1);
    throw new Error("no image in response: " + (data?.candidates?.[0]?.finishReason || "unknown"));
  }
  let buf = Buffer.from(img.inlineData.data, "base64");
  if (img.inlineData.mimeType && img.inlineData.mimeType !== "image/png") {
    const sharp = (await import("sharp")).default;
    buf = await sharp(buf).png().toBuffer();
  }
  return buf;
}

let i = 0;
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++];
    const out = join(outDir, `${job.name}.png`);
    if (existsSync(out) && !FORCE) { log(`${job.name} skip (exists)`); continue; }
    const t = Date.now();
    try {
      const buf = await generate(job);
      writeFileSync(out, buf);
      const size = job.size || SIZE;
      log(`${job.name} ok ${((Date.now() - t) / 1000).toFixed(1)}s ${MODEL}${size ? " " + size : ""}${job.ref ? " ref" : ""}`);
    } catch (e) {
      log(`${job.name} FAIL ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
