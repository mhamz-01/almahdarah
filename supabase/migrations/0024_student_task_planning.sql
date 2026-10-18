-- Weekly planning for a student's personal tasks (/student/tasks → My tasks).
--
--   planned_date  the day the student chose to do the task. Independent of
--                 due_date: a task can be due Friday but planned for Wednesday.
--                 NULL means "not planned yet".
--   completed_at  stamped when the task is ticked off (and cleared when it is
--                 un-ticked), so past weeks can be looked back on.

alter table public.student_tasks
  add column if not exists planned_date date,
  add column if not exists completed_at timestamptz;

create index if not exists student_tasks_plan_idx on public.student_tasks (student_id, planned_date);
