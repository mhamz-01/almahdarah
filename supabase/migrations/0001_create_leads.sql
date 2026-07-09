-- Generic leads table for both "book a demo" and "free course / join community" submissions.
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if the project is linked).

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_source') then
    create type public.lead_source as enum ('demo_booking', 'free_course');
  end if;
end
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source public.lead_source not null,
  name text not null,
  phone text,
  email text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- The site submits these forms anonymously (no logged-in user), so allow public inserts...
drop policy if exists "Allow public inserts" on public.leads;
create policy "Allow public inserts"
  on public.leads
  for insert
  to anon
  with check (true);

-- ...but never expose the data itself to the anon/public key. Read it from the
-- Supabase dashboard (as the table owner) or with the service role key only.
