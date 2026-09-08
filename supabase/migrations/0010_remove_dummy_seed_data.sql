-- One-time cleanup for databases that already ran the old 0007/0008 seed
-- inserts (5 dummy class_schedule rows, 6 dummy students + their attendance
-- history). Real students and classes are now added from scratch via
-- "+ Add student" / "+ Add class" in the admin panel, so this dummy data is
-- no longer wanted. Safe to run even if the seed rows were never inserted —
-- every delete is scoped to the exact ids the old migrations used.
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if the project is linked).

delete from public.attendance where student_id in (1, 2, 3, 4, 5, 6);
delete from public.student_notes where student_id in (1, 2, 3, 4, 5, 6);
delete from public.students where id in (1, 2, 3, 4, 5, 6)
  and username in ('ahmad.k24', 'zainab.f24', 'yusuf.a24', 'maryam.s24', 'bilal.r24', 'hafsa.n24');
delete from public.class_schedule where id in (1, 2, 3, 4, 5)
  and subject in ('Tafsīr', 'Arabic', 'Ḥadīth', 'Aqīdah');
