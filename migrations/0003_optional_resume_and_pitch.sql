-- Applications can now arrive without a resume (the person leaves an email instead), and carry the AI-drafted intro.
-- Additive only: existing rows read as has_resume = 1 with NULL email/pitch. Resume-less submissions keep the
-- NOT NULL file columns filled with '' / 0 and has_resume = 0, so nothing that reads them breaks.
ALTER TABLE submissions ADD COLUMN has_resume INTEGER NOT NULL DEFAULT 1;
ALTER TABLE applications ADD COLUMN email TEXT; -- typed by the person (required when there's no resume)
ALTER TABLE applications ADD COLUMN pitch TEXT; -- the "how we'd introduce you" draft they saw
ALTER TABLE applications ADD COLUMN pitch_source TEXT; -- ai | fallback
