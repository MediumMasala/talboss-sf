-- One lead per person when the no-email path sends the same resume twice (first without an email, then with the
-- typed one). Additive only: old rows keep resume_sha256 = NULL and are never merged into.
ALTER TABLE submissions ADD COLUMN resume_sha256 TEXT; -- hex SHA-256 of the resume bytes; NULL without a resume

CREATE INDEX submissions_resume_sha256 ON submissions (resume_sha256, created_at);

-- Only complete leads (with an email) go to the Google Sheet. An email-less row still waiting (pending) is taken out
-- of the queue; it goes to the sheet once the same resume comes back with an email.
UPDATE submissions SET sheet_pending = 0
WHERE sheet_pending = 1 AND email = ''
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.submission_id = submissions.id AND COALESCE(a.email, '') <> '');
