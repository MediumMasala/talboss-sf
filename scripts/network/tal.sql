-- Tal app (Metabase db 12, schema tal). One row per Tal user (all of them, so the merge knows who is a Tal user).
-- Output: Grapevine user id (the shared person key; every Tal user has one), function, US flags, company key.
-- Title = the person's current job title from their LinkedIn-sourced experience (lowest-ordinal row with is_current).
-- The LinkedIn headline is NOT used: people with a headline but no current job are mostly students and job-seekers
-- ("aspiring data analyst | python | sql"), and headlines over-count AI.
-- No names, emails or phones are selected.
WITH cur AS (
  SELECT DISTINCT ON (e."user_Id") e."user_Id" AS gid, lower(trim(e.title)) AS t, e.company_id
  FROM tal.user_experience e
  WHERE e.is_current AND coalesce(trim(e.title), '') <> ''
  ORDER BY e."user_Id", e.ordinal NULLS LAST
),
tc AS (                       -- classify each distinct title once
  SELECT t, /*CASE*/ AS fn
  FROM (SELECT DISTINCT t FROM cur) x
),
cc AS (
  SELECT id, (regexp_match(lower(name), '^(google|alphabet|microsoft|amazon|aws|amazon web services|uber|salesforce|adobe|linkedin|paypal|intuit|spotify|razorpay|sarvam)\M'))[1] AS vco
  FROM tal.company
),
loc AS (
  SELECT user_id AS gid,
         (lower(location_full) ~ '(san francisco|bay area|san jose, california|mountain view|palo alto|sunnyvale|santa clara|menlo park|redwood city|cupertino|oakland, california|berkeley, california|fremont, california|san mateo|milpitas|foster city)') AS bay,
         (lower(location_full) ~ '(united states|\musa\M|bay area|new york city metropolitan|greater seattle|greater boston|los angeles metropolitan|greater chicago|dallas-fort worth|washington dc-baltimore|greater philadelphia|atlanta metropolitan|denver metropolitan|greater houston)') AS us
  FROM tal.user_profile
  WHERE coalesce(location_full, '') <> ''
),
c AS (
  SELECT u.grapevine_id AS id, tc.fn,
         coalesce(loc.us OR loc.bay, false) AS us, coalesce(loc.bay, false) AS bay,
         coalesce(c1.vco, c2.vco) AS vco
  FROM tal.users u
  LEFT JOIN cur ON cur.gid = u.grapevine_id
  LEFT JOIN tc ON tc.t = cur.t
  LEFT JOIN loc ON loc.gid = u.grapevine_id
  LEFT JOIN cc c1 ON c1.id = cur.company_id
  LEFT JOIN cc c2 ON c2.id = u.current_company_id
  WHERE u.deleted_at IS NULL AND u.grapevine_id IS NOT NULL
)
SELECT id, fn, us, bay, vco
FROM c
