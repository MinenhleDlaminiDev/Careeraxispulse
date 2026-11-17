-- ============================================================================
-- AXIS-38 — add the "Practical Application" section to every pillar.
--
-- schema.sql seeds interview_content only when the table is EMPTY, so the seed
-- alone never reaches a project that already has the row. This migration adds
-- the new block to the existing content.
--
-- Each pillar gains a "practical" object:
--   lead     the opening instruction
--   example  the worked example (pillars 01-03)
--   prompt   the sample AI prompt (pillar 04 only)
--   action   "YOUR ACTION:"
--   caution  the "IMPORTANT:" warning (pillar 04 only)
--
-- Safe to re-run: || merges, so it overwrites rather than duplicating, and
-- pillars are matched on "number" so their order does not matter.
-- ============================================================================

update public.interview_content ic
set content = jsonb_set(
      ic.content,
      '{pillars}',
      (
        select jsonb_agg(
          case p ->> 'number'
        when '01' then p || '
        {
          "practical": {
            "lead": "Break down all major responsibilities in the job description and identify the processes, tools and competencies required to perform each one.",
            "example": "If the position requires data analysis, understand how data is collected, cleaned, analysed and interpreted. Identify how tools such as Excel, SQL or Power BI may be used to produce insights that support business decisions.",
            "action": "Practise explaining how you would approach the major responsibilities, including the methods you would use and the expected outcomes. Use possible interview questions to test your understanding of the role."
          }
        }'::jsonb
        when '02' then p || '
        {
          "practical": {
            "lead": "Connect relevant findings from your organisational research to the position’s responsibilities and the employer’s objectives.",
            "example": "If an organisation is expanding its digital services, consider how a Data Analyst could contribute through customer trend analysis, performance reporting and identifying opportunities for improvement.",
            "action": "Practise answering possible questions about the organisation, particularly why you want to work there and how your position contributes to its objectives. Support your responses with verified information."
          }
        }'::jsonb
        when '03' then p || '
        {
          "practical": {
            "lead": "Match the major job requirements to relevant examples from your CV. Use the STAR method to structure your responses around the Situation, Task, Action and Result, where applicable.",
            "example": "Instead of simply stating “I have data analysis skills,” explain a genuine project where you cleaned data, analysed trends using Excel or Power BI and presented findings to address a specific problem.",
            "action": "Practise answering competency-based questions using genuine examples from your experience, academic projects or transferable skills. Explain your personal contribution and the outcome without exaggeration."
          }
        }'::jsonb
        when '04' then p || '
        {
          "practical": {
            "lead": "Use AI tools to generate possible interview questions based on the complete job description and your CV. Ensure the tool receives the full job description so it can identify the responsibilities, required competencies and employer expectations.",
            "prompt": "Act as an interviewer for this position. Analyse the complete job description and my CV. Generate possible technical, behavioural and situational interview questions aligned with the employer’s requirements. Ask me one question at a time, evaluate my responses and suggest improvements based on my actual knowledge, skills and experience.",
            "action": "Select only questions strongly aligned with the position, what the employer is looking for and your actual capabilities. Use these questions to practise applying what you learned across the first three pillars.",
            "caution": "Do not treat every AI-generated question as relevant. Prioritise questions supported by the job description and practise responding naturally rather than memorising answers."
          }
        }'::jsonb
            else p
          end
          order by ord
        )
        from jsonb_array_elements(ic.content -> 'pillars') with ordinality as t(p, ord)
      )
    ),
    updated_at = now()
where ic.content ? 'pillars';
