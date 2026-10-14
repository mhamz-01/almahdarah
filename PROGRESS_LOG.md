# Progress Log

Newest entry first. Each entry records what was done, where things stand, and what's next.
Feature details live in their own docs (see links).

---

## 2026-10-13: Fewer Gemini requests, failure-proofing

- **Clips are now 20 minutes** (was 5): a 60-min lecture = 3 requests instead of 12.
  `LECTURE_NOTES_SEGMENT_MINUTES` overrides it. Transcribe route `maxDuration` is 300, which
  **needs Vercel Fluid compute** (to verify in the Vercel dashboard). A real 20-min clip of
  lesson 46 took 66.3s and passed validation.
- **Bad answers are never saved**: truncated (MAX_TOKENS), looping, over-long or blocked
  Gemini output is retried instead of stored as a transcript.
- **Retries are cheaper**: max 3, waits 15/45/90s (or Gemini's own `retryDelay`), 15s minimum
  between requests.
- **Transcript tab** shows each part with time range, size, a warning flag and an
  "Open at m:ss" YouTube link for checking.
- `npm run test:notes`: 21 tests, all pass.
- **Changing the clip length deletes lesson 46's 5 saved 5-minute clips** the next time it is
  started (clip count changes 10 -> 3). Its test draft stays. Just run Generate again.
- Still uncommitted.

---

## 2026-10-12: AI lecture notes for course videos

Full feature doc: [LECTURE_NOTES_FEATURE.md](LECTURE_NOTES_FEATURE.md)

### Goal
In the admin portal, generate structured study notes from a course lesson's YouTube video
with one click, have an admin review them, then publish them to students under the video.
The videos have no captions or transcripts.

### What was done
1. **Chose an approach.** OpenAI can't read YouTube links, and YouTube blocks servers from
   downloading the audio. Picked **Gemini** (it reads public YouTube URLs directly) for the
   transcript and **OpenAI** for writing the notes.
2. **Tested the APIs on real lectures before building:**
   - `gemini-2.5-flash` returns 404 for new API keys, so we use `gemini-3.8-flash`.
   - A 10-minute clip took about 60s, which is the Vercel function limit, so lectures are
     processed in **5-minute clips**.
   - Gemini sometimes returns 503 "high demand" errors, so the client retries automatically.
   - YouTube's watch page and the Data API both refuse server requests, so the **video
     length is read in the admin's browser** with the YouTube IFrame player.
   - Notes model chosen: `gpt-5.4-mini`, about 11s and accurate (compared with `gpt-4.1`).
3. **Built the whole pipeline.** Migration, 4 admin API routes, browser-side runner, admin
   "Lecture notes" page with a review/edit/publish dialog, student notes section under the
   video, and a "New lecture notes" notification. Typecheck, lint and `next build` all pass.
4. **The user ran migration 0021** and tested on **lesson 46 ("Class 22", Aqeedah course,
   48 min)**.
5. **Hit the Gemini free-tier limit: 20 requests per day.** The 503s in the logs were partly
   quota errors that the code kept retrying, which wasted requests.
   - Fixed: a *daily* quota 429 now stops right away with a clear "click Resume after the
     quota resets" message (`lib/lesson-notes/transcribe.ts`). Not yet tested against a
     real quota error.
6. **Tried an OpenAI-only route (Option 2: yt-dlp script on the admin PC). Abandoned.**
   YouTube's bot check ("Sign in to confirm you're not a bot") blocks it even from a home
   PC. It would need browser login cookies, and the user said not to implement it. The
   packages that were installed (`youtube-dl-exec`, `ffmpeg-static`) were removed again.
7. **Test notes for lesson 46.** Composed from the 5 clips transcribed so far (minutes
   0–25) using a one-off scratchpad script, not app code. Saved as a **draft** on
   `lesson_notes` row 46. Its status was left as `transcribing`, so the row shows both
   **Review** and **Resume**. The quality is good. One stray Arabic word needs a manual
   fix ("being فوق / above").
8. **Made a cost calculator** (private artifact):
   https://claude.ai/artifact/XCFf6vjE8VLVsQmHL33uMJ
   A 60-minute lecture costs about **$0.17** on paid Gemini 3.8 Flash plus gpt-5.4-mini.
   Gemini's price doubles on 1 Jan 2027, which makes it about $0.31.

### Current state
- **Nothing is committed.** All feature files are uncommitted in the working tree, on `main`.
- Migration `0021_create_lesson_notes.sql` **has been run** in Supabase.
- The app is still wired to **Gemini (free tier)** for transcription. The user asked to
  "disconnect Gemini" only as part of Option 2, which was dropped, so nothing was
  disconnected.
- Lesson 46: clips 0–4 of 10 are saved, plus a partial test draft. **Don't publish it**,
  because it covers only 25 minutes. **Don't click Regenerate** on it either, because that
  deletes the saved clips.
- `package.json` has one new dependency: `react-markdown@^10.1.0`.

### Open decision (the user hasn't picked yet)
1. Enable billing on the Gemini key. No code change, and the 20/day cap goes away.
2. Stay on the free tier with 20-minute clips (about 3 requests per lecture). This needs
   `maxDuration = 300` on the transcribe route, which requires Vercel Fluid compute.
3. OpenAI-only: download each MP4 in YouTube Studio and upload it in the admin panel
   (Option 1).
4. Pause the feature: hide the sidebar link and keep the code.

### Next steps
- Get the user's decision above.
- After the quota resets, click **Resume** on lesson 46 to finish clips 5–9, then review the
  full draft.
- Commit once the user has tested the feature (ask first).
