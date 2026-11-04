# Pitch samples (round 3)

Every output below is verbatim from `POST /api/pitch` on local dev, Nov 4 2026, model `gemini-3-flash-preview`. The inputs are `docs/team/pitch-fixtures.json`: the founder's real cached profile, five fictional profiles, the frontend's Jordan Avery mock, and thin and typed-answer variants. No strangers were scraped.

## What changed (Steve round 2, must-fix 3)
- **No closing sentence.** Pitches are exactly 2 factual sentences. Every closing line we tried turned into a formula: "A team building X gets a Y who Z", then "a problem X has already solved", then "fits a team…". A third sentence from the model is now dropped before the vet runs.
- **Title + one typed sentence only:** a single sentence with their words, title and company. A second sentence could only be padding; it was inventing "dropped packets… customer revenue".
- **The vet now also rejects:**
  - actually, over hype, hype, snappy, real world, production-ready, rigor/rigorous and critical, unless the person's own facts use the word (Noor's about says "code that actually runs");
  - closing formulas: the "gets a X who" frame, "needs <name>", "already solved", "solves", "the problem of", and team-fit conclusions;
  - "they" more than once, and "This follows / This background" openers.
- "Orchard’s" (curly apostrophe) and "React-based" no longer trip the name check.

**Steve's check:** 0 of 10 outputs use the "gets a" frame; none contains a banned word that isn't in the person's own facts; no first name appears more than twice.

**Latency:** uncached direct runs, 18 drafts: p50 1.04 s, p95 2.26 s, 1 fallback. Endpoint calls below: 1007, 1071, 1078, 1133, 1154, 1229, 1482, 2147, 2495 ms.

**Still weak, honestly:**
- "This work involves / This included" opens the second sentence in a few pitches. It is allowed, but it is a tic.
- When the typed answer comes with a full profile, the model can still imply it happened at the current employer ("This work follows a zero-downtime Postgres upgrade…").
- The founder's pitch is only as good as his LinkedIn: his current role has no description.

## founder · real (founder's own cached LinkedIn profile)

**Input**

- typed: **Sanchit Tripathi**, Strategy Lead at Grapevine
- headline: Join tal.club | Building Tal Boss | Ex Elevation, Google
- about: Mission - To help build and scale technology that positively impacts a sizeable number of people. Reach out at -
- now: Building, tal by grapevine
- now: Building, Grapevine
- was: Investment Professional, Elevation Capital (Focused on Consumer Tech, Marketplaces, Climate & Agri investments at Elevation)
- was: Account Manager, Google (Helped SMEs & startups grow their business through Ads)
- project: Android App Project - Radius: Radius is a location based utility app that finds and sorts the places around you under various categories (cafe, bars, shopping etc.) based on their distance a
- school: St. Xavier's College, Bachelor of Management Studies(BMS)

**Output** · `source: ai` · `needsMore: false` · 1482 ms

> Sanchit builds technology designed to scale, moving from Google account management for startups to venture investing at Elevation Capital. After focusing on consumer tech and marketplaces at Elevation, Sanchit now leads strategy at Grapevine to ship products that impact a sizeable number of people.

## ml-researcher · fictional: ML researcher

**Input**

- typed: **Noor Haddad**, Research Scientist at Kestrel AI
- headline: Research Scientist at Kestrel AI · post-training for code models
- about: I work on post-training for code models: reward models built from unit-test and execution signals, and RL that rewards code that actually runs. Before industry I did a PhD on why long-context language models miss facts in the middle of their input.
- now: Research Scientist, Kestrel AI (Post-training for code models. Built the execution-feedback reward pipeline and the eval harness the team uses to gate every model release.)
- was: Research Intern, Lattice Research (Studied long-context retrieval failures in transformer language models; paper accepted at NeurIPS 2023.)
- was: PhD Researcher, University of Toronto
- skills: PyTorch, JAX, Reinforcement Learning, LLM Evaluation, Distributed Training
- school: University of Toronto, PhD, Computer Science

**Output** · `source: ai` · `needsMore: false` · 1154 ms

> Noor builds post-training pipelines for Kestrel AI code models, specifically reward models that prioritize code that actually runs. This work involves building the execution-feedback reward pipeline and the evaluation harness Noor now uses to gate every model release.

## infra-engineer · fictional: infra engineer

**Input**

- typed: **Tomás Reyes**, Senior Infrastructure Engineer at Pylon Systems
- headline: Senior Infrastructure Engineer at Pylon Systems | making deploys boring
- about: I like making deploys boring. I run the Kubernetes platform our product teams ship on, and I care a lot about on-call that doesn't burn people out.
- now: Senior Infrastructure Engineer, Pylon Systems (Moved 140 services from hand-rolled EC2 boxes onto a Kubernetes platform across three regions; cut median deploy time from 40 minutes to 6.)
- was: Site Reliability Engineer, Cobalt Pay (Primary on-call for card authorization. Wrote the incident review process the company still uses.)
- skills: Kubernetes, Terraform, Go, PostgreSQL, Observability

**Output** · `source: ai` · `needsMore: false` · 1133 ms

> Tomás moved 140 services from hand-rolled EC2 boxes onto a Kubernetes platform across three regions for Pylon Systems. This migration cut median deploy time from 40 minutes to 6, reflecting a focus on making deploys boring and maintaining on-call systems that do not burn people out.

## product-manager · fictional: PM

**Input**

- typed: **Hannah Lindqvist**, Senior Product Manager at Fathom Docs
- headline: Senior PM, real-time collaboration at Fathom Docs
- about: Former engineer turned PM. I like products where the hard part is invisible: sync, conflict resolution, offline. I write SQL and still read the code.
- now: Senior Product Manager, Fathom Docs (Own real-time collaboration and comments. Launched offline mode for 2M weekly users after two failed attempts by other teams.)
- was: Product Manager, Relay Freight (Rebuilt carrier onboarding; activation went from 31% to 58%.)
- was: Software Engineer, Relay Freight
- skills: Product Strategy, SQL, User Research, Experimentation

**Output** · `source: ai` · `needsMore: false` · 1007 ms

> Hannah leads real-time collaboration at Fathom Docs, focusing on invisible technical challenges like sync and conflict resolution. This former engineer launched offline mode for 2M weekly users after Hannah previously rebuilt carrier onboarding at Relay Freight to move activation from 31% to 58%.

## designer · fictional: designer

**Input**

- typed: **Kwame Asante**, Staff Product Designer at Orchard
- headline: Staff Product Designer at Orchard · money interfaces people trust
- about: I design money interfaces people trust, and I prototype in code because static mocks lie about how things feel.
- now: Staff Product Designer, Orchard (Lead designer for the card and budgeting app. Redesigned onboarding and identity verification; built and shipped Orchard's design system, Grove, in React.)
- was: Product Designer, Tandem Travel (Mobile booking flows. Ran weekly usability sessions with travelers.)
- skills: Figma, Prototyping, React, Design Systems

**Output** · `source: ai` · `needsMore: false` · 1071 ms

> Kwame designs money interfaces at Orchard by prototyping in code to ensure the final product feels right. After shipping the Grove design system in React, Kwame redesigned the onboarding and identity verification flows for the card and budgeting app.

## data-scientist · fictional: data scientist

**Input**

- typed: **Mei Tanaka**, Senior Data Scientist at Harbor Grocery
- headline: Senior Data Scientist · forecasting and experimentation
- about: Forecasting and experimentation. I like problems where a better model shows up as less food thrown away.
- now: Senior Data Scientist, Harbor Grocery (Built the demand forecasting models behind replenishment for 300 stores. Maintain the stats engine of our experimentation platform (CUPED, sequential testing).)
- was: Data Analyst, Northline Insurance (Claims fraud models and the dashboards investigators used every morning.)
- skills: Python, Causal Inference, Forecasting, SQL, dbt

**Output** · `source: ai` · `needsMore: false` · 1078 ms

> Mei builds the demand forecasting models behind replenishment for 300 Harbor Grocery stores, turning better models into less food thrown away. This work involves maintaining a stats engine for experimentation using CUPED and sequential testing after Mei previously built claims fraud models at Northline Insurance.

## frontend-mock · frontend preview mock (components/select/preview.ts), headline + jobs only

**Input**

- typed: **Jordan Avery**, Senior ML Engineer at Parallax Labs
- headline: Senior ML Engineer at Parallax Labs · inference, evals, and the boring parts that make models fast
- now: Senior ML Engineer, Parallax Labs
- was: ML Engineer, Orbitline
- was: Software Engineer, Fieldnote

**Output** · `source: ai` · `needsMore: true` · 2147 ms

> Jordan, a Senior ML Engineer at Parallax Labs, builds the inference and evaluation systems that make models fast. Jordan focuses on the boring parts of ML like performance and reliability, after working on engineering teams at Orbitline and Fieldnote.

## thin · thin: typed title only, no LinkedIn

**Input**

- typed: **Ana Ruiz**, Staff Engineer at Stripe
- no LinkedIn profile

**Output** · `source: fallback` · `needsMore: true` · 6 ms

> Ana is a staff engineer at Stripe.

## thin+answer · thin + one typed sentence (bold move)

**Input**

- typed: **Ana Ruiz**, Staff Engineer at Stripe
- **answer (typed):** "I rebuilt our webhook retry system so merchants stop missing events during outages."
- no LinkedIn profile

**Output** · `source: ai` · `needsMore: false` · 1229 ms

> Ana, a Staff Engineer at Stripe, rebuilt the webhook retry system to ensure merchants stop missing events during outages.

## infra+answer · rich + one typed sentence

**Input**

- typed: **Tomás Reyes**, Senior Infrastructure Engineer at Pylon Systems
- **answer (typed):** "The hardest thing I've shipped was a zero-downtime Postgres major-version upgrade under live payment traffic."
- headline: Senior Infrastructure Engineer at Pylon Systems | making deploys boring
- about: I like making deploys boring. I run the Kubernetes platform our product teams ship on, and I care a lot about on-call that doesn't burn people out.
- now: Senior Infrastructure Engineer, Pylon Systems (Moved 140 services from hand-rolled EC2 boxes onto a Kubernetes platform across three regions; cut median deploy time from 40 minutes to 6.)
- was: Site Reliability Engineer, Cobalt Pay (Primary on-call for card authorization. Wrote the incident review process the company still uses.)
- skills: Kubernetes, Terraform, Go, PostgreSQL, Observability

**Output** · `source: ai` · `needsMore: false` · 2495 ms

> Tomás migrated 140 Pylon Systems services from EC2 to Kubernetes across three regions, cutting median deploy time from 40 minutes to 6. This work follows a zero-downtime Postgres major-version upgrade Tomás shipped under live payment traffic.
