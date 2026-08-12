-- MindWeave: Authentication profiles and newsletter subscribers
-- Run this script once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  is_newsletter_subscriber boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true,
  source text not null default 'website',
  unique (email)
);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on public.newsletter_subscribers (subscribed_at desc);

alter table public.user_profiles enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Users can create their own profile" on public.user_profiles;
create policy "Users can create their own profile"
  on public.user_profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
  on public.user_profiles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Anyone can subscribe with a valid email" on public.newsletter_subscribers;
create policy "Anyone can subscribe with a valid email"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'
    and length(email) <= 320
    and is_active = true
  );

-- There is intentionally no public SELECT policy for newsletter_subscribers.
-- Read/export subscribers only from the Supabase Dashboard or a protected admin backend.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
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

-- Optional: automatically create a profile when a confirmed/auth user is created.
-- The frontend also performs an upsert, so this trigger is not required for registration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, full_name, is_newsletter_subscriber)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    true
  )
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    is_newsletter_subscriber = true,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Export query for the owner inside the Supabase SQL Editor only:
-- select email, subscribed_at, source from public.newsletter_subscribers
-- where is_active = true order by subscribed_at desc;

-- Do not add a public SELECT policy: exposing the full email list in frontend code is unsafe.

-- Supabase Auth settings to verify manually:
-- 1) Authentication > URL Configuration > Site URL: https://mindweave.store
-- 2) Additional Redirect URLs: https://mindweave.store/login.html
-- 3) Email provider: enabled
-- 4) If testing without email confirmation, disable confirmation temporarily only in a private test environment.

-- Important: the anon key is safe for browser use only when RLS is enabled as above.
-- Never place a service_role key in HTML or JavaScript.
