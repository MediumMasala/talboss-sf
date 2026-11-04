/**
 * Where resumes go. The API route only talks to `getStorage()`.
 *
 * - On Cloudflare (and `next dev`, via OpenNext's local bindings): file in KV (`RESUMES`, key
 *   "resume:<id>"), one row per submission in D1 (`DB`, table `submissions`).
 * - Anywhere else (plain `next start`): ./.uploads/<id>/, gitignored because it's personal data.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type ResumeSubmission = {
  id: string;
  createdAt: string;
  /** Read off the resume; "" when none was found. */
  email: string;
  linkedin: string | null;
  /** null when they applied without a resume (then the email comes from the application). */
  file: { name: string; type: string; size: number; ext: string } | null;
  meta: { userAgent: string | null; referrer: string | null; utm: Record<string, string> };
  /** Policies the person agreed to by uploading (shown under the upload box). */
  consent: { privacy: string; terms: string };
};

/** Tal application details collected before the resume (name, LinkedIn, email, the intro they saw). */
export type Application = {
  program: string;
  name: string;
  company: string;
  designation: string;
  linkedinUrl: string | null;
  linkedinStatus: "confirmed" | "typed" | "skipped";
  linkedinProfile: unknown;
  /** media.licdn.com URL of the confirmed card's photo (shown on /leads through the signed proxy), or null. */
  linkedinPhoto?: string | null;
  /** Deprecated (v3): no longer collected. New rows store null; old rows keep their value in `work_auth`. */
  workAuth?: string | null;
  /** Typed by the person; required when there's no resume. */
  email: string | null;
};

export interface ResumeStorage {
  save(submission: ResumeSubmission, file: Uint8Array | null, application?: Application | null): Promise<void>;
}

/** The Worker's bindings, or null when not running on Cloudflare. */
export async function cloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.DB && env.RESUMES ? env : null;
  } catch {
    return null;
  }
}

export const resumeKey = (id: string) => `resume:${id}`;

function cloudflare(env: CloudflareEnv): ResumeStorage {
  return {
    async save(s, file, a) {
      if (file && s.file) await env.RESUMES.put(resumeKey(s.id), file, { metadata: { name: s.file.name, type: s.file.type } });
      await env.DB.prepare(
        `INSERT INTO submissions (id, created_at, email, linkedin, interests, file_name, file_type, file_size, file_ext, meta, consent, has_resume)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          s.id,
          s.createdAt,
          s.email,
          s.linkedin,
          "[]", // interests: the form that collected them is gone
          s.file?.name ?? "",
          s.file?.type ?? "",
          s.file?.size ?? 0,
          s.file?.ext ?? "",
          JSON.stringify(s.meta),
          JSON.stringify(s.consent),
          s.file ? 1 : 0,
        )
        .run();
      if (a) {
        await env.DB.prepare(
          `INSERT INTO applications (id, created_at, submission_id, program, name, company, designation, linkedin_url, linkedin_status, linkedin_profile, work_auth, meta, email, pitch, pitch_source, linkedin_photo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            crypto.randomUUID(), s.createdAt, s.id, a.program, a.name, a.company, a.designation, a.linkedinUrl, a.linkedinStatus,
            a.linkedinProfile ? JSON.stringify(a.linkedinProfile) : null, null, JSON.stringify({ utm: s.meta.utm, referrer: s.meta.referrer }),
            a.email, null, null, // pitch, pitch_source: the pitch was removed in v4; columns kept for old rows
            a.linkedinPhoto ?? null,
          )
          .run();
      }
    },
  };
}

const localDisk: ResumeStorage = {
  async save(submission, file, application) {
    const root = process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), ".uploads");
    const dir = path.join(/*turbopackIgnore: true*/ root, submission.id);
    await mkdir(dir, { recursive: true });
    if (file && submission.file) await writeFile(path.join(dir, `resume${submission.file.ext}`), file);
    await writeFile(path.join(dir, "submission.json"), JSON.stringify({ ...submission, application: application ?? null }, null, 2));
    console.info(`[storage] saved ${submission.id} (${submission.email}) -> ${dir}`);
  },
};

export async function getStorage(): Promise<ResumeStorage> {
  const env = await cloudflareEnv();
  return env ? cloudflare(env) : localDisk;
}

// Reading rows back (the leads desk, /sheet.csv, the sheet push) lives in lib/leads.ts.
