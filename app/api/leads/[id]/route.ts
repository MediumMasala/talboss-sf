import { cloudflareEnv } from "@/lib/storage";
import { readJson } from "@/lib/env";
import { cookieFrom, leadsAllowed, setNotes } from "@/lib/leads";

export const dynamic = "force-dynamic";

const MAX_NOTES = 5000;
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/** PATCH { notes } → saves the team's notes on one lead. Leads cookie or ?key=LEADS_KEY; JSON only (blocks form CSRF). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const env = await cloudflareEnv();
  const key = new URL(request.url).searchParams.get("key");
  if (!(await leadsAllowed(env, { key, cookie: cookieFrom(request) })) || !env) return new Response("Not found", { status: 404 });
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) return reply({ ok: false, error: "Send JSON." }, 415);

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return reply({ ok: false, error: "No such lead." }, 404);
  const body = await readJson(request, 40_000);
  if (!body || typeof body.notes !== "string") return reply({ ok: false, error: "Send {notes: string}." }, 400);
  const notes = body.notes.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, MAX_NOTES);

  if (!(await setNotes(env, id, notes))) return reply({ ok: false, error: "No such lead." }, 404);
  return reply({ ok: true, id, notes });
}
