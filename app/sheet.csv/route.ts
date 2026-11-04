import { cloudflareEnv, listSubmissions } from "@/lib/storage";
import { sameKey, signResumeId } from "@/lib/signing";

export const dynamic = "force-dynamic";

const HEADERS = ["Uploaded (IST)", "Name", "Company", "Designation", "Email", "LinkedIn", "LinkedIn check", "Work authorization", "Resume", "Source", "Program", "File", "ID"];

/** "2026-11-03 18:55" in IST: unambiguous, and Sheets reads it as a date-time in any locale. */
function ist(iso: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

/** Quote for CSV, and never let a value start like a formula. */
function cell(value: string | null | undefined) {
  const v = String(value ?? "").replace(/^[=+\-@\t\r]+/, "");
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Every submission as CSV, oldest first (new rows land at the bottom, so notes typed next to them stay aligned).
 * The Google Sheet pulls this with =IMPORTDATA("<origin>/sheet.csv?key=SHEET_KEY").
 */
export async function GET(request: Request) {
  const env = await cloudflareEnv();
  const url = new URL(request.url);
  if (!env?.SHEET_KEY || !env.LINK_SECRET || !sameKey(url.searchParams.get("key"), env.SHEET_KEY)) {
    return new Response("Not found", { status: 404 });
  }

  const rows = (await listSubmissions(env, 5000)).reverse();
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    const utm = (() => {
      try {
        return (JSON.parse(r.meta) as { utm?: Record<string, string> }).utm ?? {};
      } catch {
        return {};
      }
    })();
    // Applications without a resume (they left an email instead) say so in the Resume column.
    const link = r.has_resume === 0 ? "no resume" : `${url.origin}/r/${r.id}/${await signResumeId(env.LINK_SECRET, r.id)}`;
    lines.push([ist(r.created_at), r.name, r.company, r.designation, r.email || r.app_email, r.app_linkedin || r.linkedin, r.linkedin_status, r.work_auth, link, utm.utm_source, r.program, r.file_name, r.id].map(cell).join(","));
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}
