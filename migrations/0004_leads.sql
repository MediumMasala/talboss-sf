-- The leads desk (/leads) and the push to the Google Sheet (FEEDBACK_V4 §9). Additive only.
-- sheet_pending defaults to 1, so every row written before this migration is pushed on the first resync
-- (/api/leads/resync), and a new row stays pending until the sheet's web app confirms it.
ALTER TABLE submissions ADD COLUMN notes TEXT; -- typed by the team on /leads
ALTER TABLE submissions ADD COLUMN sheet_pending INTEGER NOT NULL DEFAULT 1; -- 1 until the sheet confirms the row
ALTER TABLE submissions ADD COLUMN sheet_synced_at TEXT; -- when the sheet last confirmed it (ISO)
ALTER TABLE applications ADD COLUMN linkedin_photo TEXT; -- media.licdn.com URL of the confirmed profile's photo

CREATE INDEX submissions_sheet_pending ON submissions (sheet_pending, created_at);
