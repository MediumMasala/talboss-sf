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
  file: { name: string; type: string; size: number; ext: string };
  meta: { userAgent: string | null; referrer: string | null; utm: Record<string, string> };
  /** Policies the person agreed to by uploading (shown under the upload box). */
  consent: { privacy: string; terms: string };
};

/** Tal Select application details collected before the resume (name, LinkedIn, work authorization). */
export type Application = {
  program: string;
  name: string;
  company: string;
  designation: string;
  linkedinUrl: string | null;
  linkedinStatus: "confirmed" | "typed" | "skipped";
  linkedinProfile: unknown;
  workAuth: string | null;
};

export interface ResumeStorage {
  save(submission: ResumeSubmission, file: Uint8Array, application?: Application | null): Promise<void>;
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
      await env.RESUMES.put(resumeKey(s.id), file, { metadata: { name: s.file.name, type: s.file.type } });
      await env.DB.prepare(
        `INSERT INTO submissions (id, created_at, email, linkedin, interests, file_name, file_type, file_size, file_ext, meta, consent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          s.id,
          s.createdAt,
          s.email,
          s.linkedin,
          "[]", // interests: the form that collected them is gone
          s.file.name,
          s.file.type,
          s.file.size,
          s.file.ext,
          JSON.stringify(s.meta),
          JSON.stringify(s.consent),
        )
        .run();
      if (a) {
        await env.DB.prepare(
          `INSERT INTO applications (id, created_at, submission_id, program, name, company, designation, linkedin_url, linkedin_status, linkedin_profile, work_auth, meta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            crypto.randomUUID(), s.createdAt, s.id, a.program, a.name, a.company, a.designation, a.linkedinUrl, a.linkedinStatus,
            a.linkedinProfile ? JSON.stringify(a.linkedinProfile) : null, a.workAuth, JSON.stringify({ utm: s.meta.utm, referrer: s.meta.referrer }),
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
    await writeFile(path.join(dir, `resume${submission.file.ext}`), file);
    await writeFile(path.join(dir, "submission.json"), JSON.stringify({ ...submission, application: application ?? null }, null, 2));
    console.info(`[storage] saved ${submission.id} (${submission.email}) -> ${dir}`);
  },
};

export async function getStorage(): Promise<ResumeStorage> {
  const env = await cloudflareEnv();
  return env ? cloudflare(env) : localDisk;
}

export type SubmissionRow = {
  id: string;
  created_at: string;
  email: string;
  linkedin: string | null;
  file_name: string;
  file_size: number;
  meta: string;
  name: string | null;
  company: string | null;
  designation: string | null;
  app_linkedin: string | null;
  linkedin_status: string | null;
  work_auth: string | null;
  program: string | null;
};

/** Newest first, with the Tal Select application details when there are any. */
export async function listSubmissions(env: CloudflareEnv, limit = 500): Promise<SubmissionRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.created_at, s.email, s.linkedin, s.file_name, s.file_size, s.meta,
            a.name, a.company, a.designation, a.linkedin_url AS app_linkedin, a.linkedin_status, a.work_auth, a.program
     FROM submissions s LEFT JOIN applications a ON a.submission_id = s.id
     ORDER BY s.created_at DESC LIMIT ?`,
  )
    .bind(limit)
    .all<SubmissionRow>();
  return results;
}
