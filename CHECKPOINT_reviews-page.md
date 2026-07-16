# Checkpoint — Reviews page (2026-07-10)

Work is paused mid-task (user said "stop the progress" before final verification).
Nothing is committed yet — all changes are in the working tree, uncommitted.

## Goal

Import the `Reviews.dc.html` design from the Claude Design project
(`https://claude.ai/design/p/3d1bef5e-3560-4d22-a1c3-e1442d1f4221?file=Reviews.dc.html`,
project: "Al-Mahdarah Islamic Academy Platform") as a real `/reviews` page wired to the
Supabase `reviews` table, plus a "View all reviews" button on the homepage.

## Decision made with the user

The `reviews` table previously had no moderation flag — anyone could POST to
`/api/reviews` and (if displayed raw) it would go live immediately. User chose:
**require admin approval before a review is public** (not immediate publish).
This drove the `approved` column + RLS policy + admin approve/unapprove UI below.

## What's done (uncommitted, working tree)

- `supabase/migrations/0003_add_reviews_approval.sql` — **not yet run against the DB**.
  Adds `approved boolean not null default false` to `public.reviews`, an index, and an
  `anon` SELECT policy scoped to `approved = true`.
- `lib/types.ts` — `ReviewRow` now has `approved: boolean`.
- `lib/supabase.ts` — added `getPublishedReviews()` (uses the anon/public client; RLS
  restricts it to approved rows only).
- `app/reviews/page.tsx` — new server component page, `Header` + `ReviewsExplorer` +
  `Footer`, `dynamic = "force-dynamic"`, fetches via `getPublishedReviews()`.
- `components/reviews/reviews-explorer.tsx` — new client component: rebuilds the
  Reviews.dc.html design (hero stats, rating distribution bars, star-rating filter
  pills, review card grid, load-more, CTA section linking to the existing `/review`
  submission form instead of re-implementing the inline form from the mockup).
- `components/sections/trust.tsx` — added a "View all reviews" `Button` (variant
  `invert`) next to the rating badge, linking to `/reviews`.
- `lib/data/navigation.ts` — added `{ label: "Reviews", href: "/reviews" }` to the
  header/mobile nav (between Faculty and Journal, matching the mockup's nav).
- `app/api/admin/reviews/[id]/route.ts` — new `PATCH` route, gated by the existing
  `ADMIN_SESSION_COOKIE` check, updates `approved` via `createSupabaseAdminClient()`.
- `components/admin/admin-dashboard.tsx` — reviews tab now shows a pending count,
  an all/pending/approved filter, an Approved/Pending badge per review, and an
  Approve/Unapprove toggle button wired to the new API route.

## Verified so far

- `npx tsc --noEmit` — clean.
- `npx eslint` on all touched/new files — clean.
- `npm run build` fails with `Next.js build worker exited with code: 3221226505` —
  **confirmed pre-existing**: reproduced the identical crash on a clean `main`
  (stashed all changes, rebuilt, same crash, then `git stash pop` to restore). Not
  caused by this work; likely a local Windows/Turbopack environment issue. Don't
  re-diagnose this as if it's new — check whether it's since been fixed upstream
  (Next 16.2.9 / Turbopack) before spending time on it again.
- **Not yet done**: `npm run dev` smoke test in an actual browser (login as admin,
  approve a review, confirm it appears on `/reviews`; check empty-state and filter
  behavior with zero/some reviews).

## Next steps, in order

1. Run migration `0003_add_reviews_approval.sql` against Supabase (SQL editor or
   `supabase db push`). Existing rows will default to `approved = false` — the client
   will need to approve any historical reviews they want shown publicly.
2. `npm run dev`, exercise the flow per the `verify` skill: submit a review via
   `/review`, confirm it's *not* visible on `/reviews` yet, approve it from
   `/admin`, confirm it now appears with correct stats/filters.
3. Re-attempt `npm run build` (or ask the user whether the crash is a known local
   issue / whether they build via a different environment, e.g. Vercel) — don't
   block on it if it's pre-existing and their deploy path doesn't use this
   machine's `npm run build`.
4. Once verified, offer to commit (do not commit without being asked — see repo's
   git safety rules already in play this session).

## Notes / things not to re-derive

- Route naming: used `/reviews` (plural) deliberately, since `/review` (singular)
  already exists as the standalone review-submission link shared externally.
- CTA on `/reviews` links to the existing `/review` form rather than reimplementing
  the mockup's inline prompt/form/thanks state machine — avoids duplicating
  submission logic that already lives in `components/reviews/review-form.tsx`.
- Design tokens (colors, fonts) in the Reviews.dc.html mockup already match
  `app/globals.css` exactly — no new tokens were introduced.
