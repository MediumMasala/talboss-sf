# Network numbers for "Behind Tal" (as of 5 Nov 2026)

## In plain English

- Every Tal app user is also a Grapevine user (same person id; 2,000 of 2,000 sampled Tal ids exist in Grapevine). So the network is **1,036,512 distinct people**, not 233K + 1.04M added together.
- **378,060** of them have a job title we can sort into a tech function. Leave out founders and it is **369,662**. The site's **"300,000+ tech professionals" holds.**
- Only **145,390** of those 378K are a Tal user or logged in to Grapevine in the last 12 months. "300,000+" is safe as a count of people in the network. It is not safe as "active", and the site must never say "active".
- Almost everyone's title just says "Software Engineer". So the specialist buckets are small: **Backend 2,573, Frontend 3,729, Mobile 1,259**. That is what titles say, not how many backend engineers exist. Showing them next to "300,000+" undersells us (see "Do not publish" below).
- **AI and ML engineers: 7,057.** This is real, and probably an undercount (Grapevine's title list has few AI titles).
- **US: 2,686 people. Bay Area: 522.** Fine to know, too small to brag about.

## Counts by function

One function per person, first rule that matches wins. **Combined** = distinct people. For each person we use Tal's current LinkedIn title first and fall back to the title they picked on Grapevine. "Recent" = a Tal user, or someone who logged in to Grapevine in the last 365 days.

| Function | Tal | Grapevine | **Combined** | Site display | Recent | US | Bay Area |
|---|---:|---:|---:|---|---:|---:|---:|
| Software engineers (no specialty in title) | 30,180 | 183,075 | **204,841** | 200,000+ | 69,806 | 404 | 103 |
| Engineering leads | 4,094 | 42,019 | **37,754** | 37,000+ | 19,022 | 158 | 38 |
| Data engineers, scientists and analysts | 5,272 | 29,440 | **33,620** | 33,000+ | 10,141 | 115 | 12 |
| Product managers | 6,892 | 28,006 | **29,044** | 29,000+ | 13,939 | 148 | 51 |
| QA and test (counted, not on the site) | 2,148 | 14,905 | **16,761** | n/a | 4,206 | 25 | 4 |
| Designers | 3,120 | 12,342 | **13,088** | 13,000+ | 7,200 | 35 | 9 |
| DevOps and platform | 2,218 | 9,919 | **11,787** | 11,000+ | 3,768 | 20 | 2 |
| Founders | 3,218 | 5,383 | **8,398** | 8,300+ | 4,480 | 167 | 58 |
| AI and ML engineers | 5,410 | 1,831 | **7,057** | 7,000+ | 5,849 | 89 | 25 |
| Security | 1,057 | 5,011 | **5,936** | 5,900+ | 1,766 | 31 | 10 |
| Frontend | 959 | 2,947 | **3,729** | 3,700+ | 1,392 | 2 | 0 |
| Backend | 1,103 | 1,553 | **2,573** | 2,500+ | 1,389 | 4 | 0 |
| Full-stack | 1,553 | 697 | **2,213** | 2,200+ | 1,649 | 12 | 1 |
| Mobile | 702 | 601 | **1,259** | 1,200+ | 783 | 0 | 0 |
| **Classified** | **67,926** | **337,729** | **378,060** | | **145,390** | | |
| Unclassified | 164,826 | 698,783 | **658,452** | | | | |
| **All people** | **232,752** | **1,036,512** | **1,036,512** | | | **2,686** | **522** |

Per-side columns add up to more than Combined for some rows (Engineering leads: 42,019 on Grapevine vs 37,754 combined) because when a person is in both, their Tal title wins and may put them in a different bucket.

**Unclassified: 63.5% of everyone.** Where they come from:
- Grapevine: 355,539 people never picked a title. Another 80,683 picked "Data Eng, Mgmt & Governance Associate", which we throw out (see caveats). The rest have non-tech or vague titles: Consultant, Analyst, System Engineer, Senior Engineer, Sales, HR, Finance.
- Tal: 232,752 users. 132,595 have a current job title, and 67,926 of those (51%) sort into a function. The other ~100K have no current job on their LinkedIn, mostly students and job-seekers.

## The 12 verified companies (current company, distinct people)

| Company | People | | Company | People |
|---|---:|---|---|---:|
| Amazon (incl. AWS) | 22,823 | | Razorpay | 2,936 |
| Google | 12,323 | | Adobe | 1,829 |
| Microsoft | 7,337 | | PayPal | 1,176 |
| Salesforce | 3,493 | | Uber | 987 |
| Intuit | 399 | | LinkedIn | 367 |
| Sarvam | 58 | | Spotify | 16 |
| **Total** | **53,744** | | | |

Tal's numbers come from the current company on the person's LinkedIn experience. Grapevine's come from the company they gave at sign-up (Amazon 22,057 of the 22,823, Google 11,964 of the 12,323). Matching is a prefix on the company name: "amazon …", "aws", "google …", "alphabet", "sarvam ai", and so on.

## Do not publish (or reword first)

1. **Backend 2,500+, Frontend 3,700+, Mobile 1,200+, Full-stack 2,200+.** They are true, but tiny next to 300,000+. Most engineers' titles just say "Software Engineer". Show "Software engineers 200,000+" plus AI, Data, Product, Design, DevOps, Security and Engineering leads, and leave out the four stack buckets.
2. **Engineering leads 37,000+.** 27,303 of the Grapevine side picked a list entry called "Software Lead". We can't tell whether that means team leads or senior engineers. The label is "Engineering leads". "Engineering leaders" or "managers" would not be true.
3. **Anything that says active, weekly or "on Tal".** Only 145K of the 378K were seen in the last year. 310K of the 378K are classified from Grapevine sign-up data from 2023 to 2026.
4. **Bay Area or US network size** (522 / 2,686). Too small to claim. "In early preview in the Bay Area" is fine.
5. **Spotify (16) and Sarvam (58).** Real but tiny. Don't print per-company counts for them.
6. **Data 33,000+** includes ~10K data analysts and analytics people. The label must keep "analysts". "Data scientists 33,000+" would not be true.

**What is in `content/network.json`:** 9 rows, already following points 1, 2 and 6. They are Software engineers 200,000+, Engineering leads 37,000+, Data engineers, scientists and analysts 33,000+, Product managers 29,000+, Designers 13,000+, DevOps and platform engineers 11,000+, Founders 8,300+, AI and ML engineers 7,000+ and Security 5,900+. The four stack buckets and QA are held back in `run.py` (`HOLD`). Delete a key from `HOLD` and re-run to publish it.

## How the numbers were made

Run `python3 scripts/network/run.py --write` from the repo root. It takes about 75 seconds and writes `content/network.json`.

1. `scripts/network/tal.sql` (Metabase db 12) returns one row per Tal user: Grapevine id, function, US flag, Bay flag, company key.
2. `scripts/network/grapevine.sql` (Metabase db 8, which is the same Grapevine prod as db 2) returns one row per Grapevine user who has a function, a US city or a verified company. It also returns `recent` (last_login within 365 days).
3. Both paste in `scripts/network/case.sql`, the classifier, where the query says `/*CASE*/`.
4. `run.py` downloads both as CSV exports into a private temp folder, merges on the id (Tal's function wins, then Grapevine's), counts, deletes the folder, and prints counts only. The key is read from `~/.config/tal/metabase_api_key` and never written anywhere. No names, emails or phones are selected at any step.

Per-side counts, if you want to check one side in Metabase by hand (paste the CASE from `case.sql` in place of `/*CASE*/` first):

```sql
-- Tal, db 12
SELECT fn, count(*) AS people, count(*) FILTER (WHERE us) AS us, count(*) FILTER (WHERE bay) AS bay
FROM ( <contents of scripts/network/tal.sql> ) x GROUP BY 1 ORDER BY 2 DESC;

-- Grapevine, db 8
SELECT fn, count(*) AS people, count(*) FILTER (WHERE us) AS us, count(*) FILTER (WHERE bay) AS bay
FROM ( <contents of scripts/network/grapevine.sql> ) x GROUP BY 1 ORDER BY 2 DESC;

-- Totals
SELECT count(*) FROM tal.users WHERE deleted_at IS NULL AND grapevine_id IS NOT NULL;   -- db 12: 232,752
SELECT count(*) FROM grapevine_user;                                                    -- db 8: 1,036,512
```

### Where the title comes from

- **Tal:** `tal.user_experience.title`. We use the row with `is_current`, lowest `ordinal`, joined on `"user_Id" = users.grapevine_id`. These rows are seeded from LinkedIn. The LinkedIn headline (`user_profile.headline`, which is the same as `user_linkedin_data.position`) is **not** used. People with a headline but no current job are mostly students ("aspiring data analyst | python | sql"), and headlines doubled the AI count.
- **Grapevine:** `grapevine_user.job_title_id` → `grapevine_jobtitle.name`. This is a fixed list of about 2,300 titles that users pick from at sign-up. Grapevine's own `grapevine_jobfunction` (Engineering, IT, Product Management, ...) is not used, so both sides follow the same rules.
- **Location:** Tal uses `user_profile.location_full` (LinkedIn text, e.g. "San Francisco Bay Area", "Seattle, Washington, United States"). Grapevine uses `grapevine_user.city_id` → `grapevine_city`, where the country is "United States" (only 217K Grapevine users gave a city).
- **Company:** Tal uses the current experience's `company_id` → `tal.company.name`, falling back to `users.current_company_id`. Grapevine uses `grapevine_user.company_id` → `grapevine_company.display_name`.

### Classification rules (lower-cased title, first match wins)

0. **Never counted:** intern, student, aspiring, trainee, fresher, enthusiast, learner, "looking for", seeking, open to work.
1. **AI and ML:** ai, ml, aiml, llm, genai, nlp, mlops, ai/ml, generative ai, machine learning, deep learning, artificial intelligence, computer vision, research scientist, applied scientist, prompt engineer. Not if the title also says data scientist, product manager or owner, designer, founder, CEO, sales, marketing, recruiter or business development. Those fall through to their own bucket.
2. **Backend:** backend, back end, server side, java/golang/go/node/python/php/ruby/django/.net/c# + developer or engineer.
3. **Frontend:** frontend, ui developer or engineer, react/angular/vue/javascript + developer or engineer. Not React Native.
4. **Full-stack:** full stack, fullstack, MERN, MEAN stack.
5. **Mobile:** iOS, Android, Flutter, React Native, mobile (app) developer or engineer, swift/kotlin + developer or engineer.
6. **DevOps and platform:** devops, devsecops, SRE, site reliability, platform engineer, infrastructure engineer, cloud engineer or architect, release engineer, kubernetes.
7. **Data:** data engineer/scientist/analyst/architect/platform, analytics, business intelligence, BI developer/engineer/analyst, big data, ETL, data warehouse.
8. **Security:** security, cyber, infosec, penetration test, pentest, appsec, SOC analyst.
9. **Product managers:** product manag…, APM, product owner, product lead, head/VP/director of product, chief product officer, CPO. Product marketing managers are not counted here.
10. **Designers:** product/UX/UI/visual/interaction/experience/interface/graphic/brand/motion/web/digital design, UX, user experience, user research, design lead, head of design, design director, VP design. Not learning-experience, instructional, interior, fashion, textile or jewellery design.
11. **Engineering leads:** engineering manager, EM, head of engineering/technology, VP/director of engineering, engineering lead, CTO, chief technology officer, tech lead, technical lead, software lead, lead software engineer, dev lead.
12. **Founders:** founder, co-founder, CEO, chief executive. "Founding engineer" is not a founder.
13. **QA and test** (added): QA, quality assurance, test, tester, SDET. Counted, not published.
14. **Software engineers** (added; the brief's list had no bucket for the biggest group): software, SDE, SWE, developer, programmer, member of technical staff, MTS, staff/principal/founding/application/product engineer, computer scientist, solution/technical/system/enterprise architect.

Vague titles stay unclassified: "Engineer", "Senior Engineer", "System Engineer", "Consultant", "Analyst", "Manager".

## Caveats

- **Titles are self-reported.** On Tal they come from LinkedIn. On Grapevine, people picked from a list at sign-up, often in 2024–25, so many may have changed jobs or companies since.
- **Grapevine's "Data Eng, Mgmt & Governance Associate" is thrown out.** 80,683 people picked it, two thirds of them with no company. It looks like a default or first-in-list pick, not a real job. Counting it would add ~80K "data" people we can't stand behind.
- **"Software Lead" (27,303 people)** is a Grapevine list entry with no clear meaning, and it makes up most of Engineering leads.
- **Stack buckets are undercounts.** Frontend, backend, mobile and full-stack only count people who wrote the stack in their title. Most of them sit in "Software engineers".
- **AI is probably an undercount.** Grapevine's list has few AI titles, so AI engineers there often picked "Software Engineer". 5,410 of the 7,057 come from Tal's LinkedIn titles.
- **"Distinct people" relies on Tal users being Grapevine users.** We checked with samples (1,000 oldest and 1,000 newest Tal ids, all found in Grapevine), not with a full join, because the two databases can't be queried together.
- **Location is thin.** On Tal it comes from the LinkedIn location string, matched on "United States" and the main US metro-area names. On Grapevine only 217K of 1.04M users gave a city. US and Bay Area are therefore lower bounds.
- **Company matching is by name prefix.** "Amazon" includes Amazon Pay, AWS and other Amazon entities. A company that is spelled differently is missed.
- **Recent** means a Tal user, or a Grapevine login in the last 365 days. It is not "active on Tal".
- **The "5,000+ AI and consumer startups" claim was not re-checked here.**
