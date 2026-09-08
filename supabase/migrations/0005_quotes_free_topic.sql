-- Topics are now entered freely by the admin instead of a fixed set, and the
-- era field has been removed from the quote-authoring form entirely.

alter table public.quotes drop constraint if exists quotes_topic_key_check;

-- Normalize the previously-fixed topic keys to their human-readable form,
-- since topic_key is now the exact text shown on filters and cards.
update public.quotes set topic_key = 'Ikhlāṣ' where topic_key = 'ikhlas';
update public.quotes set topic_key = 'Knowledge' where topic_key = 'knowledge';
update public.quotes set topic_key = 'Patience' where topic_key = 'patience';
update public.quotes set topic_key = 'Dunyā & Ākhirah' where topic_key = 'dunya';
update public.quotes set topic_key = 'Taqwā' where topic_key = 'taqwa';
update public.quotes set topic_key = 'Brotherhood' where topic_key = 'brotherhood';

alter table public.quotes drop column if exists era;
