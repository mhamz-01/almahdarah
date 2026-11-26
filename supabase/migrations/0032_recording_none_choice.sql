-- Lets the admin say "this class has no recording".
--
-- Recordings are linked automatically (nightly sync, and worked out on the fly by
-- the portal pages). Removing a wrong link used to delete the row, so the next page
-- load or sync simply linked the same video again. Now "No recording" is stored as
-- an admin row with no lesson: it blocks automatic linking for that date, and
-- students who missed the class see "waiting for recording" until it expires.
--
-- Run this once in the Supabase SQL Editor (after 0031).

alter table public.class_recordings alter column lesson_id drop not null;

alter table public.class_recordings drop constraint if exists class_recordings_none_is_admin;
alter table public.class_recordings
  add constraint class_recordings_none_is_admin check (lesson_id is not null or source = 'admin');
