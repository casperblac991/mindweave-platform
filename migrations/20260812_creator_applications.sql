-- MindWeave creator applications: one private application per authenticated user.
create extension if not exists pgcrypto;

create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  specialty text not null check (specialty in ('prompt-design', 'automation', 'templates', 'education', 'content', 'other')),
  portfolio_url text,
  product_idea text not null check (char_length(product_idea) between 30 and 2400),
  audience_stage text not null default 'starting' check (audience_stage in ('starting', 'growing', 'established')),
  preferred_language text not null default 'ar' check (preferred_language in ('ar', 'en', 'es', 'fr')),
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'approved', 'needs_revision', 'declined')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_note text
);

create index if not exists creator_applications_status_submitted_idx
  on public.creator_applications (status, submitted_at desc);

alter table public.creator_applications enable row level security;

drop policy if exists "Creators can submit their own application" on public.creator_applications;
create policy "Creators can submit their own application"
  on public.creator_applications for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'submitted'
    and reviewed_at is null
    and reviewer_note is null
  );

drop policy if exists "Creators can read their own application" on public.creator_applications;
create policy "Creators can read their own application"
  on public.creator_applications for select to authenticated
  using (auth.uid() = user_id);

-- Review and status changes are intentionally owner/admin-only through Supabase Dashboard or a protected backend.
