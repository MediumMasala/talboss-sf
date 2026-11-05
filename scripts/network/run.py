#!/usr/bin/env python3
"""Count the Tal + Grapevine network by function and write content/network.json.

Usage: python3 scripts/network/run.py [--write]
Reads the Metabase API key from ~/.config/tal/metabase_api_key (never printed, never stored in the repo).
Per-person rows (internal ids + labels only, no names/emails/phones) are downloaded to a private temp folder,
merged in memory, and deleted before the script exits. Only counts are printed or written.
"""
import csv, io, json, math, os, sys, tempfile, shutil, urllib.parse, urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
MB = "https://metabase.pub.gcp.gvine.app"
KEY = open(os.path.expanduser("~/.config/tal/metabase_api_key")).read().strip()
AS_OF = "2026-11-05"

LABELS = {
    "ai": "AI and ML engineers",
    "backend": "Backend engineers",
    "frontend": "Frontend engineers",
    "fullstack": "Full-stack engineers",
    "mobile": "Mobile engineers",
    "devops": "DevOps and platform engineers",
    "data": "Data engineers, scientists and analysts",
    "security": "Security engineers",
    "product": "Product managers",
    "design": "Designers",
    "eng_lead": "Engineering leads",
    "founder": "Founders",
    "qa": "QA and test engineers",
    "swe": "Software engineers",
}
# Counted and reported in docs/team/NETWORK_NUMBERS.md, but not written to the site: QA (off-message) and the four
# stack buckets (titles rarely name a stack, so they read as tiny next to "300,000+").
HOLD = {"qa", "frontend", "backend", "fullstack", "mobile"}
PUBLISH = [k for k in LABELS if k not in HOLD]
CO = {"alphabet": "google", "aws": "amazon", "amazon web services": "amazon"}


def sql(name):
    case = open(os.path.join(HERE, "case.sql")).read()
    case = "\n".join(l for l in case.splitlines() if not l.lstrip().startswith("--"))
    return open(os.path.join(HERE, name)).read().replace("/*CASE*/", "(" + case + ")")


def post(path, body, form=False):
    if form:
        data = urllib.parse.urlencode({"query": json.dumps(body)}).encode()
        ctype = "application/x-www-form-urlencoded"
    else:
        data = json.dumps(body).encode()
        ctype = "application/json"
    req = urllib.request.Request(MB + path, data=data, method="POST",
                                 headers={"x-api-key": KEY, "Content-Type": ctype})
    with urllib.request.urlopen(req, timeout=900) as r:
        return r.read()


def rows_csv(db, query, tmp, name):
    raw = post("/api/dataset/csv", {"database": db, "type": "native", "native": {"query": query}}, form=True)
    if raw[:1] == b"{":
        sys.exit("Metabase error: " + raw[:400].decode(errors="replace"))
    p = os.path.join(tmp, name)
    open(p, "wb").write(raw)
    return list(csv.DictReader(io.StringIO(raw.decode())))


def scalar(db, query):
    d = json.loads(post("/api/dataset", {"database": db, "type": "native", "native": {"query": query}}))
    if d.get("error"):
        sys.exit("Metabase error: " + str(d["error"])[:400])
    return d["data"]["rows"][0][0]


def b(v):
    return str(v).lower() == "true"


def display(n):
    step = 10000 if n >= 100000 else 1000 if n >= 10000 else 100 if n >= 1000 else 10
    return f"{(n // step) * step:,}+"


def main():
    tmp = tempfile.mkdtemp(prefix="talnet-")
    os.chmod(tmp, 0o700)
    try:
        tal_total = scalar(12, "SELECT count(*) FROM tal.users WHERE deleted_at IS NULL AND grapevine_id IS NOT NULL")
        gv_total = scalar(8, "SELECT count(*) FROM grapevine_user")
        tal = rows_csv(12, sql("tal.sql"), tmp, "tal.csv")
        gv = rows_csv(8, sql("grapevine.sql"), tmp, "gv.csv")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    T = {r["id"]: r for r in tal}
    G = {r["id"]: r for r in gv}
    out = {"tal_total": tal_total, "gv_total": gv_total, "combined_total": gv_total}

    def tally(rows, key="fn"):
        return Counter(r[key] for r in rows if r[key])

    out["tal_fn"] = tally(tal)
    out["gv_fn"] = tally(gv)

    # Combined: every Tal user is a Grapevine user (same id). Tal's current title wins; Grapevine fills the gaps.
    comb, us, bay, vco, src = Counter(), 0, 0, Counter(), Counter()
    comb_recent = Counter()
    fn_us, fn_bay = Counter(), Counter()
    for pid in set(T) | set(G):
        t, g = T.get(pid), G.get(pid)
        fn = (t and t["fn"]) or (g and g["fn"]) or ""
        if fn:
            comb[fn] += 1
            if t or (g and b(g["recent"])):
                comb_recent[fn] += 1   # a Tal user, or seen on Grapevine in the last 365 days
            src["tal" if t and t["fn"] else "grapevine"] += 1
        is_us = (t and b(t["us"])) or (g and b(g["us"]))
        is_bay = (t and b(t["bay"])) or (g and b(g["bay"]))
        us += bool(is_us); bay += bool(is_bay)
        if fn and is_us: fn_us[fn] += 1
        if fn and is_bay: fn_bay[fn] += 1
        c = (t and t["vco"]) or (g and g["vco"]) or ""
        if c:
            vco[CO.get(c, c)] += 1
    out.update(comb_recent=comb_recent, comb_recent_total=sum(comb_recent.values()), comb_fn=comb, comb_src=src, us=us, bay=bay, fn_us=fn_us, fn_bay=fn_bay, vco=vco)
    out["tal_us"] = sum(b(r["us"]) for r in tal); out["tal_bay"] = sum(b(r["bay"]) for r in tal)
    out["gv_us"] = sum(b(r["us"]) for r in gv); out["gv_bay"] = sum(b(r["bay"]) for r in gv)
    out["tal_vco"] = Counter(CO.get(r["vco"], r["vco"]) for r in tal if r["vco"])
    out["gv_vco"] = Counter(CO.get(r["vco"], r["vco"]) for r in gv if r["vco"])
    out["classified"] = {"tal": sum(out["tal_fn"].values()), "gv": sum(out["gv_fn"].values()), "combined": sum(comb.values())}
    print(json.dumps(out, indent=1, default=dict))

    if "--write" in sys.argv:
        fns = sorted(((k, n) for k, n in comb.items() if k in PUBLISH), key=lambda kv: -kv[1])
        doc = {
            "asOf": AS_OF,
            "total": "300,000+",
            "startups": "5,000+",
            "functions": [{"key": k, "label": LABELS[k], "count": n, "display": display(n)} for k, n in fns],
            "notes": "Distinct people across the Tal app and Grapevine, by current job title (Tal's LinkedIn title first, "
                     "Grapevine's sign-up title otherwise), sorted into one function each by keyword rules; see docs/team/NETWORK_NUMBERS.md.",
        }
        p = os.path.join(REPO, "content", "network.json")
        open(p, "w").write(json.dumps(doc, indent=2) + "\n")
        print("wrote", p)


if __name__ == "__main__":
    main()
