/**
 * Best-effort contact details from a resume file, so the upload needs no form.
 * Looks for an email address and a LinkedIn profile URL in:
 * - PDF: the raw file (link annotations like "mailto:") plus every small Flate-compressed stream, with
 *   text pieces from TJ/Tj operators joined back together.
 * - DOCX: word/document.xml and its relationships file (hyperlinks), read straight out of the zip.
 * Returns nulls when nothing is found; never throws.
 */

export type Contact = { email: string | null; linkedin: string | null };

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}/g;
const LINKEDIN_RE = /linkedin\.com\/in\/([A-Za-z0-9_%-]{3,100})/i;
const NOT_EMAIL_TLD = /\.(png|jpe?g|gif|svg|webp|pdf|docx?)$/i;

const MAX_STREAM_BYTES = 256 * 1024;
const MAX_INFLATED_TOTAL = 4 * 1024 * 1024;
const MAX_STREAMS = 400;

const latin1 = (bytes: Uint8Array) => new TextDecoder("latin1").decode(bytes);
const utf8 = (bytes: Uint8Array) => new TextDecoder("utf-8").decode(bytes);

async function inflate(bytes: Uint8Array, format: "deflate" | "deflate-raw"): Promise<Uint8Array | null> {
  try {
    const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream(format));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

type CMap = { bytes: number; map: Map<number, string> };

const hexToBytes = (hex: string) => {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const even = clean.length % 2 ? `${clean}0` : clean;
  const out = new Uint8Array(even.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(even.slice(i * 2, i * 2 + 2), 16);
  return out;
};

const utf16 = (hex: string) => {
  const b = hexToBytes(hex);
  let out = "";
  for (let i = 0; i + 1 < b.length; i += 2) out += String.fromCharCode((b[i] << 8) | b[i + 1]);
  return out;
};

/** Parse a ToUnicode CMap (bfchar + bfrange) so glyph codes can be turned back into text. */
function parseCMap(text: string): CMap | null {
  const map = new Map<number, string>();
  let bytes = 2;
  const space = text.match(/begincodespacerange\s*<([0-9a-fA-F]+)>/);
  if (space) bytes = Math.max(1, space[1].length / 2);
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]*)>/g)) map.set(parseInt(m[1], 16), utf16(m[2]));
  }
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(<[0-9a-fA-F]*>|\[[^\]]*\])/g)) {
      const lo = parseInt(m[1], 16);
      const hi = Math.min(parseInt(m[2], 16), lo + 0xffff);
      if (m[3].startsWith("[")) {
        [...m[3].matchAll(/<([0-9a-fA-F]*)>/g)].forEach((d, i) => map.set(lo + i, utf16(d[1])));
      } else {
        const base = hexToBytes(m[3].slice(1, -1));
        for (let code = lo; code <= hi; code++) {
          const dst = base.slice();
          dst[dst.length - 1] += code - lo;
          let str = "";
          for (let i = 0; i + 1 < dst.length; i += 2) str += String.fromCharCode((dst[i] << 8) | dst[i + 1]);
          map.set(code, str);
        }
      }
    }
  }
  return map.size ? { bytes, map } : null;
}

/** The string pieces drawn inside one BT…ET text block, in order: literal "(…)" or hex "<…>". */
function textBlocks(content: string): { hex: boolean; value: string }[][] {
  const blocks: { hex: boolean; value: string }[][] = [];
  for (const bt of content.matchAll(/\bBT\b([\s\S]*?)\bET\b/g)) {
    const parts: { hex: boolean; value: string }[] = [];
    for (const m of bt[1].matchAll(/\(((?:\\.|[^)])*)\)|<([0-9a-fA-F\s]+)>/g)) {
      if (m[1] !== undefined) parts.push({ hex: false, value: m[1].replace(/\\([()\\])/g, "$1") });
      else parts.push({ hex: true, value: m[2] });
    }
    if (parts.length) blocks.push(parts);
  }
  return blocks;
}

/**
 * Turn content streams back into text. Fonts in most exported PDFs (Chrome, Google Docs, Word) draw
 * glyph codes rather than letters, so hex strings are decoded with every ToUnicode map in the file;
 * the right one yields readable text, the wrong ones yield noise the email regex ignores.
 */
function decodeContent(contents: string[], cmaps: CMap[]): string[] {
  const out: string[] = [];
  for (const content of contents) {
    const blocks = textBlocks(content);
    if (!blocks.length) continue;
    const decoders: ((hex: string) => string)[] = [
      (hex) => latin1(hexToBytes(hex)),
      ...cmaps.map((cm) => (hex: string) => {
        const b = hexToBytes(hex);
        let str = "";
        for (let i = 0; i + cm.bytes <= b.length; i += cm.bytes) {
          let code = 0;
          for (let k = 0; k < cm.bytes; k++) code = (code << 8) | b[i + k];
          str += cm.map.get(code) ?? "";
        }
        return str;
      }),
    ];
    for (const decode of decoders) {
      out.push(blocks.map((parts) => parts.map((p) => (p.hex ? decode(p.value) : p.value)).join("")).join("\n"));
    }
  }
  return out;
}

async function pdfTexts(bytes: Uint8Array): Promise<string[]> {
  const raw = latin1(bytes);
  const texts = [raw];
  const contents: string[] = [];
  const cmaps: CMap[] = [];
  let inflatedTotal = 0;
  let count = 0;
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) && count < MAX_STREAMS && inflatedTotal < MAX_INFLATED_TOTAL) {
    if (raw.slice(Math.max(0, m.index - 3), m.index) === "end") continue; // this is "endstream"
    const start = m.index + m[0].length;
    const stop = raw.indexOf("endstream", start);
    if (stop === -1) break;
    re.lastIndex = stop + 9;
    const dict = raw.slice(Math.max(0, m.index - 400), m.index);
    // Skip images and embedded font files (/Length1-3): they never hold the text we want.
    if (!dict.includes("/FlateDecode") || /\/Subtype\s*\/Image|\/Length[123]\b/.test(dict) || stop - start > MAX_STREAM_BYTES) continue;
    // Use the declared /Length when it's a plain number; otherwise drop the EOL before "endstream".
    // (DecompressionStream rejects even one byte of trailing data.)
    const declared = dict.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/);
    let end = declared ? Math.min(stop, start + Number(declared[1])) : stop;
    if (!declared) while (end > start && (raw[end - 1] === "\n" || raw[end - 1] === "\r")) end -= 1;
    count += 1;
    const inflated = await inflate(bytes.subarray(start, end), "deflate");
    if (!inflated) continue;
    inflatedTotal += inflated.length;
    const content = latin1(inflated);
    if (content.includes("begincmap")) {
      const cmap = parseCMap(content);
      if (cmap) cmaps.push(cmap);
    } else {
      texts.push(content);
      contents.push(content);
    }
  }
  return [...texts, ...decodeContent(contents, cmaps)];
}

/** Read named files out of a zip (DOCX) using the central directory. */
async function zipEntries(bytes: Uint8Array, wanted: string[]): Promise<string[]> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) return [];
  const entries = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const out: string[] = [];
  for (let n = 0; n < entries && p + 46 <= bytes.length; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = utf8(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (!wanted.includes(name) || localOffset + 30 > bytes.length) continue;
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const data = bytes.subarray(dataStart, dataStart + compSize);
    const file = method === 0 ? data : method === 8 ? await inflate(data, "deflate-raw") : null;
    if (file) out.push(utf8(file));
  }
  return out;
}

function pick(texts: string[]): Contact {
  let email: string | null = null;
  let linkedin: string | null = null;
  for (const text of texts) {
    if (!email) {
      for (const m of text.matchAll(EMAIL_RE)) {
        const candidate = m[0].replace(/^mailto:/i, "").toLowerCase();
        if (!NOT_EMAIL_TLD.test(candidate) && !candidate.endsWith("@example.com")) {
          email = candidate;
          break;
        }
      }
    }
    if (!linkedin) {
      const m = text.match(LINKEDIN_RE);
      if (m) linkedin = `https://www.linkedin.com/in/${m[1].replace(/\/+$/, "")}`;
    }
    if (email && linkedin) break;
  }
  return { email, linkedin };
}

export async function extractContact(bytes: Uint8Array, ext: string): Promise<Contact> {
  try {
    if (ext === ".pdf") return pick(await pdfTexts(bytes));
    if (ext === ".docx") {
      const xml = await zipEntries(bytes, ["word/document.xml", "word/_rels/document.xml.rels"]);
      // Strip tags between runs so "john@" + "x.com" in separate runs join up again.
      return pick([...xml.map((x) => x.replace(/<[^>]+>/g, "")), ...xml]);
    }
  } catch {
    // Fall through: a resume we can't read is still saved.
  }
  return { email: null, linkedin: null };
}
