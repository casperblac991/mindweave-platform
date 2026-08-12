-- Google moved the AI RSS endpoint. Use its current canonical HTTPS feed URL.
update public.ai_content_sources
set source_url = 'https://blog.google/innovation-and-ai/technology/ai/rss/',
    last_checked_at = null,
    last_success_at = null
where name = 'Google AI Blog';
