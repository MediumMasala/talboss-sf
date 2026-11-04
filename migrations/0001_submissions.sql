-- One row per resume upload. The file itself lives in KV under "resume:<id>".
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT,
  interests TEXT NOT NULL, -- JSON array of interest ids
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_ext TEXT NOT NULL,
  meta TEXT NOT NULL, -- JSON: userAgent, referrer, utm
  consent TEXT NOT NULL -- JSON: privacy + terms URLs agreed to
);

CREATE INDEX submissions_created_at ON submissions (created_at DESC);
