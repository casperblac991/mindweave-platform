-- Restricted operational access fallback when a Supabase service-role key is unavailable.
-- The policies rely on an allowlist of admin user IDs and are enforced by Supabase JWT auth.

create or replace function public.is_ai_ops_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.ai_ops_admins where user_id = auth.uid()
  );
$$;

grant execute on function public.is_ai_ops_admin() to authenticated;

-- An authenticated account can only check its own administrative assignment.
drop policy if exists "ai_ops_admins_read_own" on public.ai_ops_admins;
create policy "ai_ops_admins_read_own" on public.ai_ops_admins
  for select to authenticated using (user_id = auth.uid());

-- Operational data remains unavailable to ordinary signed-in users.
drop policy if exists "ai_ops_sources_admin_all" on public.ai_content_sources;
create policy "ai_ops_sources_admin_all" on public.ai_content_sources
  for all to authenticated
  using (public.is_ai_ops_admin())
  with check (public.is_ai_ops_admin());

drop policy if exists "ai_ops_drafts_admin_read_update" on public.ai_content_drafts;
create policy "ai_ops_drafts_admin_read_update" on public.ai_content_drafts
  for select to authenticated using (public.is_ai_ops_admin());
create policy "ai_ops_drafts_admin_update" on public.ai_content_drafts
  for update to authenticated
  using (public.is_ai_ops_admin())
  with check (public.is_ai_ops_admin());

drop policy if exists "ai_ops_job_runs_admin_read" on public.ai_job_runs;
create policy "ai_ops_job_runs_admin_read" on public.ai_job_runs
  for select to authenticated using (public.is_ai_ops_admin());
