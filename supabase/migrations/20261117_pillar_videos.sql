-- ============================================================================
-- AXIS-37 — point the Interview Code content at the uploaded videos.
--
-- Paths live in interview_content rather than in a new table or in the code:
-- the admin content editor already edits this row, so a video can be swapped
-- or renamed without a deploy. The value is just the object name inside the
-- private 'videos' bucket — the app turns it into a signed URL at play time.
--
-- Run 20261117_videos_bucket.sql first; it creates the bucket and its policies.
--
-- Safe to re-run: || merges, and pillars are matched on "number" so their order
-- does not matter.
-- ============================================================================

update public.interview_content ic
set content = jsonb_set(
      ic.content || '{"intro_video": "intro.mp4"}'::jsonb,
      '{pillars}',
      (
        select jsonb_agg(
          case p ->> 'number'
            when '01' then p || '{"video": "pillar-1.mp4"}'::jsonb
            when '02' then p || '{"video": "pillar-2.mp4"}'::jsonb
            when '03' then p || '{"video": "pillar-3.mp4"}'::jsonb
            when '04' then p || '{"video": "pillar-4.mp4"}'::jsonb
            else p
          end
          order by ord
        )
        from jsonb_array_elements(ic.content -> 'pillars') with ordinality as t(p, ord)
      )
    ),
    updated_at = now()
where ic.content ? 'pillars';
