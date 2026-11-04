#!/usr/bin/env node
// Original-art generator for the Tal US site (Gemini image model, no deps).
//
// Usage:
//   node scripts/art/gen.mjs <jobs.json> <outDir> [--concurrency 4] [--force]
//
// jobs.json = [{ "name": "chrome-orb-a-16x9", "aspect": "16:9", "prompt": "..." }, ...]
// Writes <outDir>/<name>.png and appends "<name> ok|FAIL <reason>" to <outDir>/log.txt.
// Skips files that already exist unless --force.
//
// The key is read from GEMINI_API_KEY in .dev.vars (gitignored) or the environment.
// It is sent only in the x-goog-api-key header and is never printed or logged.

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = process.env.ART_MODEL || "gemini-3.1-flash-image";
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
  console.error("usage: node scripts/art/gen.mjs <jobs.json> <outDir> [--concurrency N] [--force]");
  process.exit(2);
}
const ci = args.indexOf("--concurrency");
const CONC = ci > -1 ? Number(args[ci + 1]) : 4;
const FORCE = args.includes("--force");
const KEY = loadKey();
const jobs = JSON.parse(readFileSync(jobsPath, "utf8"));
mkdirSync(outDir, { recursive: true });
const logPath = join(outDir, "log.txt");
const log = (s) => { appendFileSync(logPath, s + "\n"); console.log(s); };

async function generate(job, attempt = 1) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: job.prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: job.aspect },
        },
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
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    if (attempt < 3) return generate(job, attempt + 1);
    throw new Error("no image in response: " + (data?.candidates?.[0]?.finishReason || "unknown"));
  }
  return Buffer.from(img.inlineData.data, "base64");
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
      log(`${job.name} ok ${((Date.now() - t) / 1000).toFixed(1)}s ${MODEL}`);
    } catch (e) {
      log(`${job.name} FAIL ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
