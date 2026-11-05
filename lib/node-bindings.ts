/**
 * The Worker's bindings, rebuilt for a plain Node server (Railway: `next start` with a volume at DATA_DIR).
 *
 * Same shape the code already uses on Cloudflare, so lib/storage.ts, lib/leads.ts, lib/limits.ts and the LinkedIn
 * flow run unchanged:
 *   DB       a D1-compatible adapter over better-sqlite3: ${DATA_DIR}/talboss.sqlite (WAL). Supports exactly what the
 *            code calls: prepare(sql).bind(...).first(col?) / .all() / .run(), and DB.batch([...]) (one transaction).
 *   RESUMES  a KV-compatible adapter: get(key, "text"|"json"|"arrayBuffer"|"stream"), getWithMetadata, put(key, value,
 *            { metadata, expirationTtl }), delete. Values live in a `kv` table in the same SQLite file, with expiry
 *            honoured on read (rate-limit counters, the 6 h lookup cache, job records, photos). Resume files
 *            (keys "resume:<id>") are kept as real files under ${DATA_DIR}/resumes/ so a backup is a plain folder.
 *   vars     every secret from process.env (APIFY_TOKEN, LINK_SECRET, SHEET_KEY, LEADS_*, GEMINI_API_KEY).
 *
 * migrations/*.sql are applied in order on first use, tracked in `d1_migrations` (the table wrangler uses), so a D1
 * export and this file are interchangeable. Idempotent. See docs/team/RAILWAY.md.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type BetterSqlite3 from "better-sqlite3";

type Db = BetterSqlite3.Database;
type Stmt = BetterSqlite3.Statement<unknown[], unknown>;

/** True on a Railway-style Node server: DATA_DIR set and not inside a Worker. */
export function useNodeBindings(): boolean {
  if (!process.env.DATA_DIR) return false;
  return !(typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers");
}

/* ------------------------------------------------------------------ SQLite file + migrations */

const MIGRATIONS_TABLE = "d1_migrations"; // wrangler's own tracking table, so a dump moves either way

function migrationsDir() {
  return process.env.MIGRATIONS_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "migrations");
}

/** Apply every migrations/*.sql not yet in d1_migrations, in filename order, each in its own transaction. */
export function migrate(db: Db): string[] {
  db.exec(`CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`);
  const dir = migrationsDir();
  if (!existsSync(dir)) throw new Error(`[node-bindings] no migrations folder at ${dir} (set MIGRATIONS_DIR)`);
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  const has = db.prepare(`SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE name = ?`);
  const mark = db.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`);
  for (const name of files) {
    const sql = readFileSync(path.join(dir, name), "utf8");
    // IMMEDIATE takes the write lock first, so two processes can never apply the same file twice.
    const ran = db
      .transaction(() => {
        if (has.get(name)) return false;
        db.exec(sql);
        mark.run(name);
        return true;
      })
      .immediate();
    if (ran) applied.push(name);
  }
  return applied;
}

function openDb(dataDir: string): Db {
  // Loaded here, not at the top, so the Cloudflare bundle never evaluates the native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3") as typeof BetterSqlite3;
  mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, "talboss.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = OFF"); // D1's default; the schema has none anyway
  const applied = migrate(db);
  if (applied.length) console.info(`[node-bindings] applied migrations: ${applied.join(", ")}`);
  db.exec(`CREATE TABLE IF NOT EXISTS _kv (
    key TEXT PRIMARY KEY,
    value BLOB,
    file TEXT,
    metadata TEXT,
    expires_at INTEGER
  )`);
  db.exec(`CREATE INDEX IF NOT EXISTS _kv_expires ON _kv (expires_at) WHERE expires_at IS NOT NULL`);
  return db;
}

/* ------------------------------------------------------------------ D1 adapter */

/** D1 accepts ?, ?NNN and mixes of both; better-sqlite3 only takes plain ? with an array. Rewrite to plain ?. */
function positional(sql: string, args: unknown[]): { sql: string; args: unknown[] } {
  if (!/\?\d/.test(sql)) return { sql, args };
  let out = "";
  const bound: unknown[] = [];
  let next = 0;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === "`") {
      const end = sql.indexOf(c, i + 1);
      const stop = end < 0 ? sql.length : end;
      out += sql.slice(i, stop + 1);
      i = stop;
      continue;
    }
    if (c === "?") {
      const m = /^\d+/.exec(sql.slice(i + 1));
      if (m) {
        const n = Number(m[0]);
        bound.push(args[n - 1]);
        next = Math.max(next, n);
        i += m[0].length;
      } else {
        bound.push(args[next++]);
      }
      out += "?";
      continue;
    }
    out += c;
  }
  return { sql: out, args: bound };
}

/** D1's value rules: booleans become 0/1, bytes become BLOBs, undefined is an error (as on D1). */
function toSqlite(v: unknown): unknown {
  if (v === undefined) throw new Error("D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'");
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v instanceof ArrayBuffer) return Buffer.from(v);
  if (ArrayBuffer.isView(v)) return Buffer.from(v.buffer, v.byteOffset, v.byteLength);
  return v;
}

type Meta = { duration: number; size_after: number; rows_read: number; rows_written: number; last_row_id: number; changed_db: boolean; changes: number };
type Result<T> = { success: true; results: T[]; meta: Meta };

const meta = (t0: number, changes = 0, lastRowId = 0): Meta => ({
  duration: performance.now() - t0,
  size_after: 0,
  rows_read: 0,
  rows_written: changes,
  last_row_id: Number(lastRowId),
  changed_db: changes > 0,
  changes,
});

class NodeStatement {
  private db: Db;
  private cache: Map<string, Stmt>;
  readonly sql: string;
  readonly args: unknown[];

  constructor(db: Db, cache: Map<string, Stmt>, sql: string, args: unknown[] = []) {
    this.db = db;
    this.cache = cache;
    this.sql = sql;
    this.args = args;
  }

  /** Like D1: returns a new statement with these values; the original stays unbound. */
  bind(...values: unknown[]) {
    return new NodeStatement(this.db, this.cache, this.sql, values.map(toSqlite));
  }

  private stmt(): { s: Stmt; args: unknown[] } {
    const p = positional(this.sql, this.args);
    let s = this.cache.get(p.sql);
    if (!s) {
      s = this.db.prepare(p.sql);
      if (this.cache.size > 500) this.cache.clear();
      this.cache.set(p.sql, s);
    }
    return { s, args: p.args };
  }

  /** Synchronous core, so batch() can run inside one SQLite transaction. */
  exec<T>(): Result<T> {
    const t0 = performance.now();
    const { s, args } = this.stmt();
    if (s.reader) return { success: true, results: s.all(...args) as T[], meta: meta(t0) };
    const r = s.run(...args);
    return { success: true, results: [], meta: meta(t0, r.changes, Number(r.lastInsertRowid)) };
  }

  async all<T = Record<string, unknown>>(): Promise<Result<T>> {
    return this.exec<T>();
  }

  async run<T = Record<string, unknown>>(): Promise<Result<T>> {
    return this.exec<T>();
  }

  async first<T = unknown>(col?: string): Promise<T | null> {
    const { s, args } = this.stmt();
    if (!s.reader) {
      s.run(...args);
      return null;
    }
    const row = s.get(...args) as Record<string, unknown> | undefined;
    if (!row) return null;
    if (col === undefined) return row as T;
    if (!(col in row)) throw new Error(`D1_COLUMN_NOTFOUND: Column not found (${col})`);
    return row[col] as T;
  }

  async raw<T = unknown[]>(opts?: { columnNames?: boolean }): Promise<T[]> {
    const { s, args } = this.stmt();
    if (!s.reader) {
      s.run(...args);
      return [];
    }
    const rows = s.raw(true).all(...args) as T[];
    s.raw(false);
    return opts?.columnNames ? ([s.columns().map((c) => c.name) as unknown as T, ...rows]) : rows;
  }
}

function d1(db: Db) {
  const cache = new Map<string, Stmt>();
  return {
    prepare: (sql: string) => new NodeStatement(db, cache, sql),
    /** Like D1: every statement in one transaction; any failure rolls them all back. */
    async batch<T = Record<string, unknown>>(statements: NodeStatement[]): Promise<Result<T>[]> {
      return db.transaction(() => statements.map((s) => s.exec<T>()))();
    },
    async exec(sql: string) {
      const t0 = performance.now();
      db.exec(sql);
      return { count: sql.split(";").filter((x) => x.trim()).length, duration: performance.now() - t0 };
    },
  };
}

/* ------------------------------------------------------------------ KV adapter */

type KvType = "text" | "json" | "arrayBuffer" | "stream";
type Row = { value: Buffer | null; file: string | null; metadata: string | null; expires_at: number | null };

const RESUME_PREFIX = "resume:";

function kv(db: Db, dataDir: string) {
  const resumesDir = path.join(dataDir, "resumes");
  mkdirSync(resumesDir, { recursive: true });

  const getRow = db.prepare(`SELECT value, file, metadata, expires_at FROM _kv WHERE key = ?`);
  const upsert = db.prepare(
    `INSERT INTO _kv (key, value, file, metadata, expires_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, file = excluded.file, metadata = excluded.metadata, expires_at = excluded.expires_at`,
  );
  const del = db.prepare(`DELETE FROM _kv WHERE key = ?`);
  const sweep = db.prepare(`DELETE FROM _kv WHERE expires_at IS NOT NULL AND expires_at <= ? AND file IS NULL`);
  let lastSweep = 0;

  /** "resume:<uuid>" + "Ana Resume.pdf" → "<uuid>.pdf" (only the safe characters of the id). */
  const fileFor = (key: string, meta: unknown) => {
    const id = key.slice(RESUME_PREFIX.length).replace(/[^\w.-]+/g, "_").slice(0, 120) || "resume";
    const name = (meta as { name?: unknown } | null)?.name;
    const ext = typeof name === "string" ? (/\.[a-z0-9]{1,8}$/i.exec(name)?.[0].toLowerCase() ?? "") : "";
    return `${id}${ext}`;
  };

  function live(key: string): Row | null {
    const row = getRow.get(key) as Row | undefined;
    if (!row) return null;
    if (row.expires_at !== null && row.expires_at <= Date.now()) {
      remove(key, row);
      return null;
    }
    return row;
  }

  function bytesOf(row: Row): Buffer | null {
    if (row.file) {
      try {
        return readFileSync(path.join(resumesDir, row.file));
      } catch {
        return null; // the file was removed by hand: same as a missing key
      }
    }
    return row.value ?? Buffer.alloc(0);
  }

  function decode(buf: Buffer, type: KvType): unknown {
    if (type === "arrayBuffer") return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    if (type === "stream") return new Blob([new Uint8Array(buf)]).stream();
    const text = buf.toString("utf8");
    return type === "json" ? JSON.parse(text) : text;
  }

  function remove(key: string, row?: Row | null) {
    const r = row ?? (getRow.get(key) as Row | undefined);
    del.run(key);
    if (r?.file) rmSync(path.join(resumesDir, r.file), { force: true });
  }

  const typeOf = (opt: unknown): KvType => {
    const t = typeof opt === "string" ? opt : (opt as { type?: string } | undefined)?.type;
    return t === "json" || t === "arrayBuffer" || t === "stream" ? t : "text";
  };

  async function toBuffer(value: unknown): Promise<Buffer> {
    if (typeof value === "string") return Buffer.from(value, "utf8");
    if (value instanceof ArrayBuffer) return Buffer.from(value);
    if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
    if (value instanceof ReadableStream) return Buffer.from(await new Response(value).arrayBuffer());
    throw new TypeError("KV put() accepts only strings, ArrayBuffers, ArrayBufferViews, and ReadableStreams as values.");
  }

  return {
    async get(key: string, opt?: unknown) {
      const row = live(key);
      const buf = row && bytesOf(row);
      return buf ? decode(buf, typeOf(opt)) : null;
    },
    async getWithMetadata(key: string, opt?: unknown) {
      const row = live(key);
      const buf = row && bytesOf(row);
      if (!row || !buf) return { value: null, metadata: null, cacheStatus: null };
      return { value: decode(buf, typeOf(opt)), metadata: row.metadata ? JSON.parse(row.metadata) : null, cacheStatus: null };
    },
    async put(key: string, value: unknown, opts?: { metadata?: unknown; expirationTtl?: number; expiration?: number }) {
      const ttl = opts?.expirationTtl;
      if (ttl !== undefined && !(ttl >= 60)) throw new Error(`KV PUT failed: 400 Invalid expiration_ttl of ${ttl}. Expiration TTL must be at least 60.`);
      const expires = ttl !== undefined ? Date.now() + ttl * 1000 : opts?.expiration !== undefined ? opts.expiration * 1000 : null;
      const buf = await toBuffer(value);
      const metadata = opts?.metadata === undefined ? null : JSON.stringify(opts.metadata);
      if (key.startsWith(RESUME_PREFIX)) {
        // Write to a temp name and rename, so a crash never leaves half a resume under the real name.
        const file = fileFor(key, opts?.metadata ?? null);
        const prev = getRow.get(key) as Row | undefined;
        const tmp = path.join(resumesDir, `.${file}.${process.pid}.tmp`);
        writeFileSync(tmp, buf);
        renameSync(tmp, path.join(resumesDir, file));
        upsert.run(key, null, file, metadata, expires);
        if (prev?.file && prev.file !== file) rmSync(path.join(resumesDir, prev.file), { force: true });
      } else {
        upsert.run(key, buf, null, metadata, expires);
      }
      const now = Date.now();
      if (now - lastSweep > 10 * 60_000) {
        lastSweep = now;
        sweep.run(now);
      }
    },
    async delete(key: string) {
      remove(key);
    },
  };
}

/* ------------------------------------------------------------------ the env object */

const VARS = ["APIFY_TOKEN", "LINK_SECRET", "SHEET_KEY", "LEADS_KEY", "LEADS_WEBHOOK_URL", "LEADS_WEBHOOK_SECRET", "GEMINI_API_KEY"] as const;

type NodeState = { db: Db; env: CloudflareEnv };
// One per process, even if Next loads this module in several route bundles.
const STATE = Symbol.for("talboss.node-bindings");

/** The env object for Node: DB + RESUMES over ${DATA_DIR}, and the secrets from process.env. Opened (and migrated) once. */
export function nodeEnv(): CloudflareEnv {
  const g = globalThis as unknown as Record<symbol, NodeState | undefined>;
  const hit = g[STATE];
  if (hit) return hit.env;
  const dataDir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "./data");
  const db = openDb(dataDir);
  const vars: Record<string, string> = {};
  for (const name of VARS) if (process.env[name] !== undefined) vars[name] = process.env[name] as string;
  const env = { ...vars, DB: d1(db), RESUMES: kv(db, dataDir) } as unknown as CloudflareEnv;
  g[STATE] = { db, env };
  return env;
}
