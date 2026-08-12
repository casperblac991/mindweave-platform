-- Repair a legacy user_profiles schema so auth.users signup trigger cannot fail.
alter table public.user_profiles
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and conname = 'user_profiles_user_id_key'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_user_id_key unique (user_id);
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    full_name,
    is_newsletter_subscriber
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    true
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      is_newsletter_subscriber = true,
      updated_at = now();

  return new;
end;
$$;
