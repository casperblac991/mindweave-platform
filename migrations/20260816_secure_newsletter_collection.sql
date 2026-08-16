-- Secure newsletter collection: consent logging, source attribution, and least-privilege access.
alter table public.newsletter_subscribers
  add column if not exists source text not null default 'website',
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text not null default '2026-08',
  add column if not exists unsubscribed_at timestamptz;

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe with a valid email" on public.newsletter_subscribers;
drop policy if exists "Newsletter subscribers are readable by admin" on public.newsletter_subscribers;
drop policy if exists "Newsletter subscribers are readable by operations admin" on public.newsletter_subscribers;

create policy "Newsletter subscribers are readable by operations admin"
on public.newsletter_subscribers
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_ops_admins admin
    where admin.user_id = auth.uid()
  )
);

revoke all on table public.newsletter_subscribers from anon;
revoke insert, update, delete on table public.newsletter_subscribers from authenticated;
grant select on table public.newsletter_subscribers to authenticated;

create or replace function public.subscribe_to_newsletter(
  p_email text,
  p_source text default 'website',
  p_consent boolean default false
)
returns table (email text, is_active boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_source text := lower(btrim(coalesce(p_source, 'website')));
begin
  if p_consent is not true then
    raise exception 'newsletter consent is required';
  end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or char_length(v_email) > 320 then
    raise exception 'invalid email';
  end if;
  if v_source !~ '^[a-z0-9_-]{1,80}$' then
    raise exception 'invalid source';
  end if;

  insert into public.newsletter_subscribers (
    email, subscribed_at, is_active, source, consent_at, consent_version, unsubscribed_at
  ) values (
    v_email, now(), true, v_source, now(), '2026-08', null
  ) on conflict (email) do update
  set is_active = true,
      source = excluded.source,
      subscribed_at = excluded.subscribed_at,
      consent_at = excluded.consent_at,
      consent_version = excluded.consent_version,
      unsubscribed_at = null;

  return query
    select s.email::text, s.is_active
    from public.newsletter_subscribers s
    where s.email = v_email;
end;
$$;

grant execute on function public.subscribe_to_newsletter(text, text, boolean) to anon, authenticated;
