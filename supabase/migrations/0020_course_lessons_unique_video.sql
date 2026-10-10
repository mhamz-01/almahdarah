-- One lesson per video per course. Lets the nightly playlist sync
-- (/api/cron/sync-courses) insert safely even if it runs twice.
create unique index if not exists course_lessons_course_video_uniq
  on public.course_lessons (course_id, youtube_video_id);
