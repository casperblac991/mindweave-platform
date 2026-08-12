-- Avoid AI calls for source items that already have a review-only draft.
create or replace function public.ai_content_draft_exists_for_worker(
  p_token text, p_source_url text, p_source_title text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_ai_content_worker_token(p_token);
  if nullif(trim(p_source_url), '') is null or nullif(trim(p_source_title), '') is null then
    raise exception 'invalid source item';
  end if;
  return exists (
    select 1
    from public.ai_content_drafts
    where source_url = p_source_url
      and source_title = p_source_title
  );
end;
$$;

grant execute on function public.ai_content_draft_exists_for_worker(text, text, text) to anon, authenticated;
