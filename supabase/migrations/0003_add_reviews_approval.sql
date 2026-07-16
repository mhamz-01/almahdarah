-- Adds a moderation step before a review is shown on the public Reviews page.
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if the project is linked).

alter table public.reviews
  add column if not exists approved boolean not null default false;

create index if not exists reviews_approved_idx on public.reviews (approved);

-- Approved reviews are safe to read publicly; everything else stays admin-only
-- (read via the service role key from /admin, same as leads).
drop policy if exists "Allow public read of approved reviews" on public.reviews;
create policy "Allow public read of approved reviews"
  on public.reviews
  for select
  to anon
  using (approved = true);
