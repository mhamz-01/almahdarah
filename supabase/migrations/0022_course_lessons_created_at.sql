-- Lets the student home page show "new this week" lessons. Existing lessons
-- are backfilled to their course's creation date so they don't all read as
-- brand new; lessons added later (nightly sync / admin) get now().
alter table public.course_lessons
  add column if not exists created_at timestamptz;

update public.course_lessons l
  set created_at = c.created_at
  from public.courses c
  where l.course_id = c.id and l.created_at is null;

alter table public.course_lessons
  alter column created_at set default now(),
  alter column created_at set not null;

create index if not exists course_lessons_created_idx on public.course_lessons (created_at desc);
