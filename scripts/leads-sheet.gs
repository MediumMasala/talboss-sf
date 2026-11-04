/**
 * Tal US leads → Google Sheet. The site POSTs every new lead here (and /api/leads/resync re-sends any it missed).
 * Rows are upserted by ID, so a lead sent twice is written once. Team notes go in columns L onward: they are never touched.
 *
 * Install (once, see docs/team/LEADS.md):
 *   1. In the sheet: Extensions → Apps Script → paste this file → Save.
 *   2. Project Settings (gear) → Script properties → add LEADS_WEBHOOK_SECRET = the same value you give the Worker.
 *   3. Pick `setup` → Run → Allow (writes the header row on a "Leads" tab).
 *   4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → Deploy → copy the "/exec" URL.
 *
 * Body: {"secret": "...", "rows": [{id, submittedIst, name, company, title, email, linkedinUrl, linkedinStatus,
 *        headline, resumeUrl, resumeName, source}, ...]}   Reply: {"ok": true, "written": n} or {"ok": false, "error"}.
 */

const TAB = 'Leads';
const HEADERS = ['Submitted (IST)', 'Name', 'Company', 'Title', 'Email', 'LinkedIn', 'LinkedIn status', 'Headline', 'Resume', 'Source', 'ID'];
const ID_COL = HEADERS.indexOf('ID') + 1;      // 11 (K)
const LINKEDIN_COL = HEADERS.indexOf('LinkedIn') + 1;
const RESUME_COL = HEADERS.indexOf('Resume') + 1;

function setup() {
  const sheet = leadsSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return reply_({ ok: false, error: 'bad json' });
  }
  const secret = PropertiesService.getScriptProperties().getProperty('LEADS_WEBHOOK_SECRET');
  if (!secret || !sameText_(String(body.secret || ''), secret)) return reply_({ ok: false, error: 'forbidden' });

  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 200).filter(r => r && typeof r.id === 'string' && r.id) : [];
  if (!rows.length) return reply_({ ok: true, written: 0 });

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const sheet = leadsSheet_();
    if (sheet.getLastRow() === 0) setup();
    const last = sheet.getLastRow();
    const where = {};
    if (last > 1) {
      sheet.getRange(2, ID_COL, last - 1, 1).getValues().forEach((v, i) => { if (v[0]) where[String(v[0])] = i + 2; });
    }
    let next = Math.max(last, 1) + 1;
    rows.forEach(r => {
      const at = where[r.id] || next++;
      where[r.id] = at;
      writeRow_(sheet, at, r);
    });
    return reply_({ ok: true, written: rows.length });
  } finally {
    lock.releaseLock();
  }
}

/** Health check: opening the /exec URL in a browser says it's alive (and nothing else). */
function doGet() {
  return reply_({ ok: true, service: 'tal-leads' });
}

function writeRow_(sheet, at, r) {
  const values = [
    r.submittedIst, r.name, r.company, r.title, r.email, r.linkedinUrl, r.linkedinStatus, r.headline,
    r.resumeUrl ? 'Open resume' : 'no resume', r.source, r.id,
  ].map(text_);
  const range = sheet.getRange(at, 1, 1, HEADERS.length);
  range.setNumberFormat('@');
  range.setValues([values]);
  if (r.resumeUrl) sheet.getRange(at, RESUME_COL).setRichTextValue(link_(r.resumeName ? 'Open resume (' + r.resumeName + ')' : 'Open resume', r.resumeUrl));
  if (r.linkedinUrl) sheet.getRange(at, LINKEDIN_COL).setRichTextValue(link_(r.linkedinUrl, r.linkedinUrl));
}

function leadsSheet_() {
  const book = SpreadsheetApp.getActive();
  return book.getSheetByName(TAB) || book.insertSheet(TAB, 0);
}

/** Plain text, and never a formula: a value starting with = + - @ gets a leading apostrophe. */
function text_(v) {
  const s = v == null ? '' : String(v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function link_(label, url) {
  const safe = /^https:\/\//.test(String(url)) ? String(url) : '';
  const b = SpreadsheetApp.newRichTextValue().setText(String(label));
  return (safe ? b.setLinkUrl(safe) : b).build();
}

function sameText_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
