/**
 * Per-resume links for the Google Sheet: /r/<id>/<sig>, where sig = HMAC-SHA256(LINK_SECRET, id).
 * Each link opens exactly one resume, so the sheet never holds a master key.
 */
const encoder = new TextEncoder();

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(mac.subarray(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signResumeId(secret: string, id: string): Promise<string> {
  return hmac(secret, `resume:${id}`);
}

export async function verifyResumeSig(secret: string, id: string, sig: string): Promise<boolean> {
  const expected = await signResumeId(secret, id);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Constant-time string compare for keys in query strings. */
export function sameKey(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
