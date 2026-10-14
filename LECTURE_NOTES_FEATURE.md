# Lecture Notes Feature

AI-generated study notes for course lessons. An admin generates them from the lesson's
YouTube video with one click, reviews and edits them, then publishes them. Students see
published notes under the video in their course player.

Status and history: [PROGRESS_LOG.md](PROGRESS_LOG.md)

---

## How it works

```
Admin clicks "Generate notes"
        │
        ▼
0. Read video length   ─ admin's browser, hidden YouTube IFrame player (first run only)
1. POST …/start        ─ work out the number of 20-min clips; keep clips already done
2. POST …/transcribe   ─ once per clip: Gemini reads the YouTube URL → transcript text
3. POST …/compose      ─ OpenAI turns the full transcript into Markdown notes → DRAFT
        │
        ▼
Admin reviews / edits ─ PATCH …/[lessonId]  { draftMd }
Admin publishes       ─ PATCH …/[lessonId]  { action: "publish" }  → students see it
```

- **The browser drives the pipeline**, one short request per step, so no request comes
  near Vercel's 60-second function limit.
- **Progress is saved in the database** after every clip. If the tab closes or a quota runs
  out, the lesson row shows **Resume**, which continues from the next untranscribed clip.
- **Draft and published copies are kept separate** (`draft_md` and `published_md`).
  Regenerating or editing never changes what students are reading until the admin
  publishes again.
- **Why Gemini for transcription:** OpenAI's transcription only accepts uploaded audio, and
  YouTube blocks servers (and even `yt-dlp` on a home PC) from downloading it. Gemini
  reads public YouTube URLs directly.

## Files

### Database
| File | What it does |
|---|---|
| `supabase/migrations/0021_create_lesson_notes.sql` | Adds `course_lessons.duration_seconds`, plus the tables `lesson_notes` (status, `draft_md`, `published_md`, timestamps, generated column `has_unpublished_changes`) and `lesson_transcript_segments` (one row per clip). RLS is on with no policies; all access goes through the service role. **Already run.** |
| `lib/types.ts` | `LessonNoteRow`, `LessonNoteStatus`, `LessonTranscriptSegmentRow`, and `duration_seconds` on `CourseLessonRow`. |

### Server (pipeline logic)
| File | What it does |
|---|---|
| `lib/lesson-notes/config.ts` | Clip length (`SEGMENT_SECONDS`, 20 min by default, `LECTURE_NOTES_SEGMENT_MINUTES` overrides it), 4-hour cap, the chars-per-minute sanity cap, and model names (env-overridable). |
| `lib/lesson-notes/transcribe.ts` | Step 2. Calls Gemini `generateContent` with the YouTube URL, a start/end offset for the clip, `fps: 0.1` and low media resolution (so the cost is almost entirely audio). It throws `RetryableError` (with Gemini's `retryDelay` when given) for 429, 5xx, timeouts, and any answer that isn't a complete transcript (`checkTranscript`: finish reason not `STOP`, looping/repeating text, absurd length). A plain error is thrown when the **daily** quota is used up. |
| `lib/lesson-notes/compose.ts` | Step 3. OpenAI Chat Completions with the notes prompt (sections listed below). |
| `lib/lesson-notes/admin-lesson.ts` | Shared route preamble: checks the admin session and loads the lesson and its course. |
| `lib/lesson-notes/summary.ts` | The small per-lesson summary the admin table uses (it doesn't load note text). |

### API routes (`app/api/admin/lesson-notes/[lessonId]/`)
| Route | Step | Notes |
|---|---|---|
| `start/route.ts` | 1 | Body `{ durationSeconds?, restart? }`. Saves the duration, sets status `transcribing`, and returns `{ segmentsTotal, doneSegments, durationSeconds }`. `restart: true`, or a changed clip count, deletes the saved clips. |
| `transcribe/route.ts` | 2 | Body `{ segment }`. Idempotent upsert of one clip. Returns 503 `{ retryable: true }` for temporary errors, and marks the note `failed` for permanent ones. `maxDuration = 300` (needs Vercel Fluid compute). |
| `compose/route.ts` | 3 | Requires every clip to be done. Saves `draft_md`, sets status `ready`, and sets `generated_at`. `maxDuration = 60`. |
| `route.ts` | 4 | `GET` returns the note plus its transcript (for the review dialog). `PATCH` takes `{ draftMd }` and/or `{ action: "publish" \| "unpublish" }`. `published_at` keeps the *first* publish time, so later edits don't re-announce the notes. |

### Admin UI
| File | What it does |
|---|---|
| `app/admin/(dashboard)/courses/page.tsx` | Admin page at **/admin/courses** ("Lecture notes" in the sidebar). |
| `components/admin/courses/course-notes-admin-panel.tsx` | Course tabs, the lesson table with status badges, and the Generate / Resume / Review buttons. It warns before the tab is closed mid-run. |
| `components/admin/courses/notes-pipeline.ts` | Browser runner for steps 0–3. At most 3 retries per step, waiting 15, 45 and 90 seconds (longer if Gemini says so), and at least 15s between Gemini request starts. |
| `components/admin/courses/lesson-notes-review-dialog.tsx` | Preview, Edit (Markdown) and Transcript tabs (each part shows its time range, size, a warning if it looks empty or too short, and an "Open at m:ss" link to the video), and Save draft, Publish, Unpublish and Regenerate buttons. |
| `components/admin/admin-sidebar.tsx` | The "Lecture notes" link. |
| `lib/youtube-iframe.ts` | Shared YouTube IFrame API loader plus `getYouTubeDuration()`. The loader was moved here from `course-player.tsx`. |

### Student UI
| File | What it does |
|---|---|
| `app/student/(portal)/courses/[id]/page.tsx` | Loads **only** `published_md` for the course's lessons. |
| `components/student/course-player.tsx` | "Lecture notes" section under the video, and a "Notes" tag in the lesson list. |
| `components/notes/lecture-notes.tsx` | Markdown renderer (`react-markdown`, which never renders raw HTML), shared with the admin preview. |
| `app/student/(portal)/notifications/page.tsx` | Shows a "New lecture notes" notice for 14 days after first publish. |

## Admin status badges

| Badge | Meaning | Button |
|---|---|---|
| No notes | Never generated | Generate notes |
| Transcribing x/y · Writing notes… | Running in this tab | — |
| Interrupted · x/y clips | A run stopped partway | Resume |
| Failed | A permanent error (shown under the row) | Resume |
| Draft · not published | Notes ready, students can't see them | Review |
| Published · edits pending | Live, but the draft has unpublished changes | Review |
| Published | Live and up to date | Review |

## Notes format (prompt in `compose.ts`)
English Markdown with these sections: **Overview**, **Key points** (numbered `###`
subheadings in teaching order), **Terms & definitions**, **Verses & narrations mentioned**,
**Takeaways**, **Review questions**.

Rules in the prompt:
- Only include what the teacher said.
- Never quote Qur'an or hadith text; cite it by reference.
- Transliterate terms and give a short English gloss.
- Skip unclear passages rather than guess.

To produce Urdu notes instead, edit `SYSTEM_PROMPT`.

## Configuration

| Env var | Required | Default | Used for |
|---|---|---|---|
| `GEMINI_API_KEY` | yes | — | Transcription |
| `OPENAI_API_KEY` | yes | — | Writing notes |
| `LECTURE_NOTES_SEGMENT_MINUTES` | no | `20` | Clip length (1–30). Use `5` if Fluid compute is off (60s limit) |
| `GEMINI_MODEL` | no | `gemini-3.8-flash` | Transcription model (`gemini-2.5-flash` returns 404 for new keys) |
| `OPENAI_NOTES_MODEL` | no | `gpt-5.4-mini` | Notes model |

## Measured performance (real lectures)

| Measurement | Value |
|---|---|
| Gemini, 10-min clip | ~60s, 18,981 input tokens (≈1,898/min, almost all audio), 2,532 output tokens |
| Gemini, 5-min clip (in app) | ~16–20s per request |
| Gemini, **20-min clip** (lesson 46, 0–20 min) | **66.3s**, 19,035 chars (952 chars/min), passed validation |
| OpenAI notes, 25-min transcript | ~10s, 8,072 input / 1,445 output tokens |
| Transcript size | ~4,200–4,900 characters per 5-min clip (Urdu + Arabic) |

## Cost

About **$0.17 per 60-minute lecture** ($0.142 Gemini plus $0.023 OpenAI), using paid
Gemini 3.8 Flash and gpt-5.4-mini. Gemini's price doubles on 1 Jan 2027, which makes it
about $0.31. Editing, publishing and students reading the notes cost nothing.
**Regenerate** pays the full cost again.

Calculator: https://claude.ai/artifact/XCFf6vjE8VLVsQmHL33uMJ (prices checked 2026-10-12)

## Limits and known issues

- **Gemini free tier: 20 requests per day.** With 20-minute clips a 60-minute lecture uses 3 requests (about 6 lectures a day). Only failed attempts cost extra, and retries are capped. Free-tier data may be used by Google to improve its products.
- **Needs Vercel Fluid compute** (Hobby: 300s). A 20-minute clip takes ~66s, over the old 60s limit.
- **Gemini 503 "high demand"** errors are common on the free tier. They're retried
  automatically.
- **Long lectures:** the compose step must finish in 60s. That's fine up to about an hour.
  If it fails, raise `maxDuration` in `compose/route.ts` (needs Vercel Pro or Fluid compute).
- **Videos must be public.** Gemini can't read private or unlisted videos.
- **AI output must be reviewed.** Check names, āyah and hadith references, and rulings
  before publishing. The review dialog says so.
- Clips are cut at fixed 5-minute marks, so a word at a boundary may be cut off.

## Automated tests
`npm run test:notes` runs 21 fault-injection tests (no extra dependencies, Node's built-in runner): every Gemini failure mode is retryable or a clean stop, and 200 random failure schedules never lose or redo a saved clip.

## Testing checklist
1. Admin → Lecture notes → pick a course → **Generate notes** on a short lesson.
2. Watch the badge go from Transcribing x/y to Writing notes, after which the review
   dialog opens.
3. Edit something, **Save draft**, then **Publish to students**.
4. Student portal → Courses → that lesson: the notes show under the video and the lesson
   has a "Notes" tag.
5. Student notifications show "New lecture notes".
6. Unpublish: the notes disappear for students.
7. Close the tab during transcription, reopen, and click **Resume**: it continues from the
   next clip.
