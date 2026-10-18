-- Records when a student was approved and when they first signed in.
--
--   approved_at     the day the admin accepted their access request (or created
--                   the login directly). Never changes.
--   first_login_at  stamped once, by the login route, the first time they sign
--                   in. Attendance, absences and the streak are tracked from
--                   this date onwards, so an approved student who hasn't
--                   logged in yet is never marked absent.

alter table public.students
  add column if not exists approved_at timestamptz,
  add column if not exists first_login_at timestamptz;

-- Existing students: they were approved when their row was created. Anyone who
-- has already signed in keeps their current tracking start (created_at);
-- anyone who hasn't is stamped on their first login.
update public.students set approved_at = created_at where approved_at is null;
update public.students set first_login_at = created_at where first_login_at is null and last_login_at is not null;

alter table public.students
  alter column approved_at set default now(),
  alter column approved_at set not null;
