-- Contact details collected on the /student/request-access form. Nullable
-- because requests/students created before this migration have none; the form
-- itself requires both. Accepting a request copies them onto the students row
-- so the admin can see them in /admin/students.
alter table public.student_requests add column if not exists email text;
alter table public.student_requests add column if not exists phone text;
alter table public.students add column if not exists email text;
alter table public.students add column if not exists phone text;
