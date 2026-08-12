-- MindWeave AI operations: sources, reviewable content drafts, and durable job history.
create extension if not exists pgcrypto;

create table if not exists public.ai_content_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  source_url text not null unique check (source_url ~* '^https://'),
  language text not null default 'en' check (language in ('ar', 'en', 'es', 'fr')),
  is_enabled boolean not null default true,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_content_drafts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.ai_content_sources(id) on delete set null,
  source_url text not null check (source_url ~* '^https://'),
  source_title text not null check (char_length(source_title) between 2 and 500),
  source_published_at timestamptz,
  language text not null default 'en' check (language in ('ar', 'en', 'es', 'fr')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'published')),
  title text not null check (char_length(title) between 2 and 500),
  summary text not null check (char_length(summary) between 20 and 5000),
  body text,
  relevance_score numeric(4,3) check (relevance_score >= 0 and relevance_score <= 1),
  source_hash text not null unique check (char_length(source_hash) = 64),
  generated_by text not null default 'gpt-5-mini',
  reviewer_note text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('content_cycle', 'health_check', 'draft_publish')),
  status text not null check (status in ('running', 'succeeded', 'failed', 'skipped')),
  processed_count integer not null default 0 check (processed_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  error_summary text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_content_drafts_status_created_idx on public.ai_content_drafts (status, created_at desc);
create index if not exists ai_job_runs_type_started_idx on public.ai_job_runs (job_type, started_at desc);

alter table public.ai_content_sources enable row level security;
alter table public.ai_content_drafts enable row level security;
alter table public.ai_job_runs enable row level security;

-- No client-facing policies are created: only the protected server using the service role may manage operational data.

drop trigger if exists ai_content_sources_set_updated_at on public.ai_content_sources;
create trigger ai_content_sources_set_updated_at before update on public.ai_content_sources
for each row execute function public.set_updated_at();

drop trigger if exists ai_content_drafts_set_updated_at on public.ai_content_drafts;
create trigger ai_content_drafts_set_updated_at before update on public.ai_content_drafts
for each row execute function public.set_updated_at();
