-- Grapevine (Metabase db 8, same data as db 2; public schema). One row per Grapevine user who has a function, a US city or a verified company.
-- Titles come from Grapevine's own title list (grapevine_jobtitle, ~2,300 names) picked by the user at sign-up,
-- so the classifier runs once per title name, not once per user.
-- 'Data Eng, Mgmt & Governance Associate' is excluded: 80K users, two thirds with no company, it behaves like a default pick.
-- No names, emails or phones are selected.
WITH tc AS (
  SELECT id, /*CASE*/ AS fn
  FROM (SELECT id, lower(name) AS t FROM grapevine_jobtitle
        WHERE name <> 'Data Eng, Mgmt & Governance Associate') x
),
cc AS (
  SELECT id, (regexp_match(lower(display_name), '^(google|alphabet|microsoft|amazon|aws|amazon web services|uber|salesforce|adobe|linkedin|paypal|intuit|spotify|razorpay|sarvam)\M'))[1] AS vco
  FROM grapevine_company
),
ci AS (
  SELECT id,
         (country_id = 'United States') AS us,
         (country_id = 'United States' AND name IN ('San Francisco','San Jose','Mountain View','Palo Alto','Sunnyvale','Santa Clara','Menlo Park','Redwood City','Cupertino','Oakland','Berkeley','Fremont','San Mateo','Milpitas','Foster City','South San Francisco')) AS bay
  FROM grapevine_city
),
c AS (
  SELECT u.id, tc.fn, coalesce(ci.us, false) AS us, coalesce(ci.bay, false) AS bay, cc.vco,
         (u.last_login > now() - interval '365 days') AS recent   -- logged in to Grapevine in the last year
  FROM grapevine_user u
  LEFT JOIN tc ON tc.id = u.job_title_id
  LEFT JOIN ci ON ci.id = u.city_id
  LEFT JOIN cc ON cc.id = u.company_id
)
SELECT id, fn, us, bay, vco, recent
FROM c
WHERE fn IS NOT NULL OR us OR vco IS NOT NULL
