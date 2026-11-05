-- Function classifier. `t` = lower(job title). First match wins, in this order.
-- Shared by tal.sql (db 12) and grapevine.sql (db 8; db 2 is the same Grapevine prod); run.py pastes it in where the query says /*CASE*/.
CASE
  -- 0. Not yet a working professional: never counted
  WHEN t ~ '(\mintern(ship)?s?\M|student|aspiring|trainee|fresher|enthusiast|\mlearner\M|looking for|seeking|open to work)'
    THEN NULL
  -- 1. AI and ML engineers and researchers (data scientists go to Data; AI PMs, designers, founders, sales fall through)
  WHEN t !~ '(data scien|product manag|product owner|designer|founder|\mceo\M|sales|marketing|recruit|business development)'
   AND t ~'(\m(ai|ml|aiml|llm|llms|genai|nlp|mlops)\M|ai/ml|ml/ai|gen ai|generative ai|machine learning|deep learning|artificial intelligence|computer vision|research scientist|applied scientist|prompt engineer)'
    THEN 'ai'
  -- 2. Backend
  WHEN t ~ '(back[ -]?end|server[ -]side|\m(java|golang|go|node(\.?js)?|python|php|ruby|django|\.net|dotnet|c#) (developer|engineer)\M)'
    THEN 'backend'
  -- 3. Frontend (react native goes to Mobile)
  WHEN t !~ 'react[ -]?native'
   AND t ~ '(front[ -]?end|\mui (developer|engineer)\M|\m(react(\.?js)?|angular|vue(\.?js)?|javascript) (developer|engineer)\M)'
    THEN 'frontend'
  -- 4. Full-stack
  WHEN t ~ '(full[ -]?stack|\mmern\M|\mmean stack\M)'
    THEN 'fullstack'
  -- 5. Mobile
  WHEN t ~ '(\mios\M|android|flutter|react[ -]?native|\mmobile (app )?(developer|engineer)\M|\m(swift|kotlin) (developer|engineer)\M)'
    THEN 'mobile'
  -- 6. DevOps, SRE, platform
  WHEN t ~ '(dev[ -]?ops|devsecops|\msre\M|site reliability|platform engineer|infrastructure engineer|cloud (engineer|architect)|release engineer|kubernetes)'
    THEN 'devops'
  -- 7. Data
  WHEN t ~ '(data (engineer|scien|analy|architect|platform)|analytics|business intelligence|\mbi (developer|engineer|analyst)\M|big data|\metl\M|data warehouse)'
    THEN 'data'
  -- 8. Security
  WHEN t ~ '(security|cyber|infosec|penetration test|pentest|appsec|\msoc analyst\M)'
    THEN 'security'
  -- 9. Product managers (not product marketing, not project managers)
  WHEN t ~ '(product manag|\mapm\M|product owner|product lead|head of product|vp,? (of )?product|vice president,? (of )?product|director,? (of )?product|chief product|\mcpo\M)'
    THEN 'product'
  -- 10. Designers (product/UX/UI/visual and close cousins; not interior, fashion or instructional)
  WHEN t !~ 'learning experience|instructional|interior|fashion|textile|jewel'
   AND t ~ '((product|ux|ui|ui/ux|ux/ui|visual|interaction|experience|interface|graphic|brand|motion|web|digital) design|\mux\M|user experience|user research|design lead|head of design|design director|vp,? (of )?design)'
    THEN 'design'
  -- 11. Engineering managers and leads
  WHEN t ~ '(engineering manag|\mem\M|head of (engineering|technology|tech)\M|(vp|vice president),? (of )?engineering|director,? (of )?engineering|engineering director|engineering lead|\mcto\M|chief technology|tech(nical)? lead|software lead|lead software engineer|development lead|dev lead)'
    THEN 'eng_lead'
  -- 12. Founders
  WHEN t ~ '(founder|\mceo\M|chief executive)'
    THEN 'founder'
  -- 13. QA and test (added, so test roles do not inflate "software engineers")
  WHEN t ~ '(\mqa\M|quality assurance|\mtest(ing)?\M|\mtester\M|\msdet\M|automation test)'
    THEN 'qa'
  -- 14. Software engineers with no specialty in the title (added: the brief's 12 buckets leave the biggest group out)
  WHEN t ~ '(solution architect|technical architect|systems? architect|enterprise architect|software|\msde\M|\msde[ -]?[1-9]|\mswe\M|developer|programmer|member (of )?technical staff|\mmts\M|staff engineer|principal engineer|founding engineer|application engineer|product engineer|computer scien)'
    THEN 'swe'
  ELSE NULL
END
