-- Restricted worker bridge for the review-only content cycle.
-- The token hash is injected at deployment time and the plaintext token stays in Render only.
create table if not exists public.ai_content_worker_tokens (
  token_hash text primary key check (char_length(token_hash) = 64),
  label text not null default 'render-content-worker',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ai_content_worker_tokens enable row level security;

insert into public.ai_content_worker_tokens (token_hash, label, is_active)
values ('__TOKEN_HASH__', 'render-content-worker', true)
on conflict (token_hash) do update set is_active = true;

create or replace function public.assert_ai_content_worker_token(p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_token is null or not exists (
    select 1 from public.ai_content_worker_tokens
    where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
      and is_active = true
  ) then
    raise exception 'unauthorized content worker';
  end if;
end;
$$;

create or replace function public.get_ai_content_sources_for_worker(p_token text)
returns table (id uuid, name text, source_url text, language text)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_ai_content_worker_token(p_token);
  return query
    select s.id, s.name, s.source_url, s.language
    from public.ai_content_sources s
    where s.is_enabled = true
    order by s.created_at asc
    limit 20;
end;
$$;

create or replace function public.start_ai_content_cycle(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_job_id uuid;
begin
  perform public.assert_ai_content_worker_token(p_token);
  insert into public.ai_job_runs (job_type, status)
  values ('content_cycle', 'running')
  returning id into v_job_id;
  return v_job_id;
end;
$$;

create or replace function public.finish_ai_content_cycle(
  p_token text, p_job_id uuid, p_status text, p_processed_count integer,
  p_created_count integer, p_error_summary text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_ai_content_worker_token(p_token);
  if p_status not in ('succeeded', 'failed', 'skipped') then
    raise exception 'invalid job status';
  end if;
  update public.ai_job_runs
  set status = p_status,
      processed_count = greatest(coalesce(p_processed_count, 0), 0),
      created_count = greatest(coalesce(p_created_count, 0), 0),
      error_summary = left(p_error_summary, 1000),
      completed_at = now()
  where id = p_job_id and job_type = 'content_cycle';
end;
$$;

create or replace function public.store_ai_content_draft_from_worker(
  p_token text, p_source_id uuid, p_source_url text, p_source_title text,
  p_source_published_at timestamptz, p_language text, p_title text,
  p_summary text, p_body text, p_relevance_score numeric, p_source_hash text,
  p_generated_by text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_draft_id uuid;
begin
  perform public.assert_ai_content_worker_token(p_token);
  if p_language not in ('ar', 'en', 'es', 'fr') or char_length(p_source_hash) <> 64 then
    raise exception 'invalid content draft';
  end if;
  if not exists (select 1 from public.ai_content_sources where id = p_source_id and is_enabled = true) then
    raise exception 'source is unavailable';
  end if;
  insert into public.ai_content_drafts (
    source_id, source_url, source_title, source_published_at, language, status,
    title, summary, body, relevance_score, source_hash, generated_by
  ) values (
    p_source_id, p_source_url, p_source_title, p_source_published_at, p_language, 'draft',
    p_title, p_summary, p_body, greatest(0, least(1, p_relevance_score)), p_source_hash, p_generated_by
  ) on conflict (source_hash) do nothing
  returning id into v_draft_id;
  return v_draft_id;
end;
$$;

create or replace function public.touch_ai_content_source_from_worker(
  p_token text, p_source_id uuid, p_success boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_ai_content_worker_token(p_token);
  update public.ai_content_sources
  set last_checked_at = now(),
      last_success_at = case when p_success then now() else last_success_at end
  where id = p_source_id;
end;
$$;

revoke all on function public.assert_ai_content_worker_token(text) from public;
grant execute on function public.get_ai_content_sources_for_worker(text) to anon, authenticated;
grant execute on function public.start_ai_content_cycle(text) to anon, authenticated;
grant execute on function public.finish_ai_content_cycle(text, uuid, text, integer, integer, text) to anon, authenticated;
grant execute on function public.store_ai_content_draft_from_worker(text, uuid, text, text, timestamptz, text, text, text, text, numeric, text, text) to anon, authenticated;
grant execute on function public.touch_ai_content_source_from_worker(text, uuid, boolean) to anon, authenticated;
