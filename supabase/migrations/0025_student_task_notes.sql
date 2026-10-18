-- The student's own notes/comments on a personal task (shown and edited in the
-- task drawer). Separate from `description`, which is what the task is.

alter table public.student_tasks
  add column if not exists notes text not null default '';
