-- AI lecture notes for course lessons, generated from the admin portal.
--
-- Pipeline (driven by the admin's browser, one short request per step):
--   1. start       → lesson_notes.status = 'transcribing', old segments cleared
--   2. transcribe  → Gemini transcribes the YouTube video in 5-minute clips,
--                    one row per clip in lesson_transcript_segments
--   3. compose     → OpenAI turns the joined transcript into Markdown notes,
--                    saved as draft_md, status = 'ready'
--   4. publish     → draft_md is copied to published_md, which is the only
--                    thing students ever see
--
-- Keeping draft and published copies apart means regenerating or editing notes
-- never disturbs what students are currently reading.
-- Reads/writes go through the service role, so RLS is on with no policies.

-- Filled in the first time notes are generated (read from the YouTube player).
alter table public.course_lessons add column if not exists duration_seconds int;

create table if not exists public.lesson_notes (
  lesson_id bigint primary key references public.course_lessons (id) on delete cascade,
  status text not null default 'transcribing'
    check (status in ('transcribing', 'composing', 'ready', 'failed')),
  segments_total int not null default 0,
  error text,
  draft_md text,
  published_md text,
  generated_at timestamptz,
  published_at timestamptz,
  -- Lets the admin lesson table show "unpublished changes" without loading the text.
  has_unpublished_changes boolean generated always as
    (draft_md is not null and draft_md is distinct from published_md) stored,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_transcript_segments (
  lesson_id bigint not null references public.course_lessons (id) on delete cascade,
  idx int not null,
  start_seconds int not null,
  end_seconds int not null,
  text text not null,
  created_at timestamptz not null default now(),
  primary key (lesson_id, idx)
);

create index if not exists lesson_notes_published_idx on public.lesson_notes (published_at desc)
  where published_md is not null;

alter table public.lesson_notes enable row level security;
alter table public.lesson_transcript_segments enable row level security;
