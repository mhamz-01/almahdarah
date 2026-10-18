-- Email preferences for the two student emails (managed at /student/reminders):
--
--   weekly_digest   the Monday progress email (classes, tasks). On by default;
--                   students can switch it off.
--   plan_reminder   the personal reminder of that day's planned tasks. Off by
--                   default; the student turns it on and picks the days.
--   reminder_days   ISO weekdays to send it on (1 = Monday ... 7 = Sunday).
--
-- last_*_sent_on make the cron jobs idempotent: a retry or a second run on the
-- same day never emails a student twice. last_test_at rate-limits "send me a
-- test email". A student with no row here simply gets the defaults.

create table if not exists public.student_email_prefs (
  student_id bigint primary key references public.students (id) on delete cascade,
  weekly_digest boolean not null default true,
  plan_reminder boolean not null default false,
  reminder_days smallint[] not null default '{1,2,3,4,5}',
  last_digest_sent_on date,
  last_reminder_sent_on date,
  last_test_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Read and written only through the service role (student API routes and cron).
alter table public.student_email_prefs enable row level security;
