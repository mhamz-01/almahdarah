-- Reviews table for the public "leave a review" link shared with the community.
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if the project is linked).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'reviewer_type') then
    create type public.reviewer_type as enum ('parent', 'student');
  end if;
end
$$;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reviewer_type public.reviewer_type not null,
  name text not null,
  country text not null,
  city text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
create index if not exists reviews_rating_idx on public.reviews (rating);

alter table public.reviews enable row level security;

-- Reviewers submit anonymously via a shared link, so allow public inserts...
drop policy if exists "Allow public inserts" on public.reviews;
create policy "Allow public inserts"
  on public.reviews
  for insert
  to anon
  with check (true);

-- ...but never expose the data itself to the anon/public key. Read/approve reviews
-- from the Supabase dashboard (as the table owner) or with the service role key only.
