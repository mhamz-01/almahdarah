-- Tracks when a quote actually became publicly visible, separate from
-- created_at (which never changes). Powers two things on the public Wall of
-- Quotes: sorting newest-published-first, and showing a "New" tag for the
-- first 24 hours after a quote is published.

alter table public.quotes add column if not exists published_at timestamptz;

-- Backfill: every quote that already exists was published at creation time
-- under the old flow, so created_at is the closest true value we have.
update public.quotes set published_at = created_at where published_at is null and published = true;

create index if not exists quotes_published_at_idx on public.quotes (published_at desc);

-- Whenever `published` transitions to true — on insert or update — stamp
-- published_at with the current time. This covers every write path (create,
-- publish/unpublish toggle, full edit-save) without the application having
-- to track the previous state itself. Editing an already-published quote
-- does NOT touch published_at, since `published` doesn't change in that case.
create or replace function public.set_quotes_published_at()
returns trigger as $$
begin
  if new.published = true and (TG_OP = 'INSERT' or old.published is distinct from true) then
    new.published_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists quotes_set_published_at on public.quotes;
create trigger quotes_set_published_at
  before insert or update on public.quotes
  for each row execute function public.set_quotes_published_at();
