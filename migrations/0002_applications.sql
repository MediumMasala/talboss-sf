-- Tal Select (US) applications: who they are, the LinkedIn profile they confirmed, and the resume they uploaded.
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  submission_id TEXT NOT NULL, -- submissions.id (the resume)
  program TEXT NOT NULL, -- "tal-select-us"
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  designation TEXT NOT NULL,
  linkedin_url TEXT,
  linkedin_status TEXT NOT NULL, -- confirmed | typed | skipped
  linkedin_profile TEXT, -- JSON: the card they said "yes" to
  work_auth TEXT,
  meta TEXT NOT NULL -- JSON: utm, referrer
);

CREATE INDEX applications_submission ON applications (submission_id);
CREATE INDEX applications_created_at ON applications (created_at DESC);
