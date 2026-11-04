import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cloudflareEnv } from "@/lib/storage";
import { formatBytes } from "@/lib/validation";
import {
  LEADS_COOKIE, humanTime, leadEmail, leadLinkedin, leadPhoto, leadProfile, leadSource, leadsAllowed, listLeads, pendingCount, resumeUrl, type LeadRow,
} from "@/lib/leads";
import { Avatar, NotesField, ResyncButton } from "./client";
import s from "./leads.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leads · Tal", robots: { index: false, follow: false } };

const PER_PAGE = 50;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

/** Only real profile links, so a value off a resume can't become a javascript: href. */
function safeLinkedin(v: string): string {
  const url = /^https?:\/\//i.test(v) ? v : /^(www\.)?([a-z]{2,3}\.)?linkedin\.com\//i.test(v) ? `https://${v}` : "";
  try {
    return url && /(^|\.)linkedin\.com$/i.test(new URL(url).hostname) ? url : "";
  } catch {
    return "";
  }
}

function pageHref(q: string, page: number) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `/leads?${qs}` : "/leads";
}

const STATUS_LABEL: Record<string, string> = { confirmed: "LinkedIn confirmed", typed: "LinkedIn typed", skipped: "LinkedIn skipped" };

async function Card({ r, secret }: { r: LeadRow; secret: string }) {
  const profile = leadProfile(r.linkedin_profile);
  const [photo, resume] = await Promise.all([leadPhoto(secret, r), resumeUrl("", secret, r)]);
  const name = r.name || "(no name)";
  const linkedin = safeLinkedin(leadLinkedin(r));
  const email = leadEmail(r);
  const status = r.linkedin_status ?? "";
  return (
    <article className={s.card}>
      <div className={s.top}>
        <Avatar src={photo} name={r.name ?? ""} />
        <div className={s.who}>
          <h2 className={s.name}>{name}</h2>
          {r.designation || r.company ? (
            <p className={s.role}>
              {r.designation}
              {r.designation && r.company ? " at " : ""}
              {r.company}
            </p>
          ) : null}
          {profile.headline ? <p className={s.headline}>{profile.headline}</p> : null}
          <p className={s.chips}>
            {status ? <span className={status === "confirmed" ? s.chipSolid : s.chip}>{STATUS_LABEL[status] ?? status}</span> : null}
            {linkedin ? (
              <a className={s.link} href={linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn profile ↗
              </a>
            ) : null}
            {profile.location ? <span className={s.muted}>{profile.location}</span> : null}
          </p>
        </div>
        <div className={s.side}>
          {email ? (
            <a className={s.email} href={`mailto:${email}`}>
              {email}
            </a>
          ) : (
            <span className={s.muted}>No email</span>
          )}
          {resume ? (
            <span className={s.resume}>
              <a className={s.buttonSolid} href={`${resume}?dl=1`}>
                Download resume
              </a>
              <a className={s.link} href={resume} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </span>
          ) : (
            <span className={s.muted}>No resume (left an email)</span>
          )}
          {resume && r.file_name ? (
            <span className={s.small}>
              {r.file_name} · {formatBytes(r.file_size)}
            </span>
          ) : null}
          <span className={s.small}>
            <time dateTime={r.created_at}>{humanTime(r.created_at, "IST")}</time> · {humanTime(r.created_at, "PT")}
          </span>
          <span className={s.small}>Source: {leadSource(r.meta)}</span>
          {r.sheet_pending ? <span className={s.small}>Not in the sheet yet</span> : null}
        </div>
      </div>
      {profile.experience.length ? (
        <ol className={s.exp}>
          {profile.experience.map((e, i) => (
            <li key={i}>
              <strong>{e.title || "Role"}</strong>
              {e.company ? ` · ${e.company}` : ""}
              {e.duration ? <span className={s.muted}> · {e.duration}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
      <NotesField id={r.id} initial={r.notes ?? ""} />
    </article>
  );
}

/** The leads desk: every application, newest first, with the resume one click away. Open with /leads?key=LEADS_KEY. */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const key = one(sp.key);
  // Swap the key for a cookie and drop it from the address bar.
  if (key) redirect(`/leads/login?key=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ""}`);

  const env = await cloudflareEnv();
  const cookie = (await cookies()).get(LEADS_COOKIE)?.value;
  if (!env?.LINK_SECRET || !(await leadsAllowed(env, { cookie }))) notFound();

  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);
  const [{ rows, total }, pending] = await Promise.all([listLeads(env, { q, page, perPage: PER_PAGE }), pendingCount(env)]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const connected = !!(env.LEADS_WEBHOOK_URL && env.LEADS_WEBHOOK_SECRET);

  return (
    <main className={s.desk}>
      <header className={s.header}>
        <div className={s.titleRow}>
          <h1 className={s.title}>Leads</h1>
          <span className={s.muted}>
            {total} {q ? `matching “${q}”` : "total"}
          </span>
        </div>
        <div className={s.tools}>
          <form className={s.search} action="/leads" method="get" role="search">
            <input name="q" defaultValue={q} placeholder="Search name, company or email" aria-label="Search leads" />
            <button type="submit" className={s.button}>
              Search
            </button>
            {q ? (
              <a className={s.link} href="/leads">
                Clear
              </a>
            ) : null}
          </form>
          <a className={s.button} href="/sheet.csv?download=1">
            Download CSV
          </a>
          <ResyncButton connected={connected} />
        </div>
        <p className={s.small}>
          {connected
            ? pending
              ? `${pending} lead${pending === 1 ? "" : "s"} not in the Google Sheet yet. Resync pushes them.`
              : "Every lead is in the Google Sheet."
            : "Google Sheet not connected (LEADS_WEBHOOK_URL / LEADS_WEBHOOK_SECRET unset). See docs/team/LEADS.md."}
        </p>
      </header>

      {rows.length ? (
        <section className={s.list}>
          {rows.map((r) => (
            <Card key={r.id} r={r} secret={env.LINK_SECRET} />
          ))}
        </section>
      ) : (
        <p className={s.empty}>{q ? "No leads match that search." : "No leads yet."}</p>
      )}

      {pages > 1 ? (
        <nav className={s.pager} aria-label="Pages">
          {page > 1 ? (
            <a className={s.button} href={pageHref(q, page - 1)}>
              ← Newer
            </a>
          ) : (
            <span />
          )}
          <span className={s.muted}>
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <a className={s.button} href={pageHref(q, page + 1)}>
              Older →
            </a>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}
