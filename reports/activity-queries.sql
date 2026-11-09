-- MindWeave activity baseline (aggregate-only queries)
-- Run in Supabase SQL Editor. These queries return counts and trends, not email addresses.

-- 1) Registered accounts and recent signups
select
  count(*) as total_registered_accounts,
  count(*) filter (where created_at >= now() - interval '30 days') as signups_last_30_days,
  count(*) filter (where created_at >= now() - interval '90 days') as signups_last_90_days
from auth.users;

-- 2) Confirmed accounts and confirmation rate
select
  count(*) as total_accounts,
  count(*) filter (where email_confirmed_at is not null) as confirmed_accounts,
  round(
    100.0 * count(*) filter (where email_confirmed_at is not null) / nullif(count(*), 0),
    2
  ) as confirmation_rate_percent
from auth.users;

-- 3) Newsletter growth by day (last 90 days)
select
  date_trunc('day', subscribed_at)::date as day,
  count(*) as new_subscribers
from public.newsletter_subscribers
where subscribed_at >= now() - interval '90 days'
group by 1
order by 1;

-- 4) Newsletter totals and active subscribers
select
  count(*) as total_subscriber_records,
  count(*) filter (where is_active) as active_subscribers,
  count(*) filter (where subscribed_at >= now() - interval '30 days') as new_last_30_days
from public.newsletter_subscribers;

-- 5) Creator-program applications by status
select status, count(*) as applications
from public.creator_applications
group by status
order by applications desc;

-- 6) Creator applications over time (last 90 days)
select
  date_trunc('day', submitted_at)::date as day,
  count(*) as applications
from public.creator_applications
where submitted_at >= now() - interval '90 days'
group by 1
order by 1;

-- 7) AI content worker health
select
  job_type,
  status,
  count(*) as runs,
  max(started_at) as last_started_at,
  max(completed_at) as last_completed_at
from public.ai_job_runs
where started_at >= now() - interval '90 days'
group by job_type, status
order by last_started_at desc;

-- 8) Recent activity summary in one row
select
  (select count(*) from auth.users where created_at >= now() - interval '30 days') as new_accounts_30d,
  (select count(*) from public.newsletter_subscribers where subscribed_at >= now() - interval '30 days') as new_subscribers_30d,
  (select count(*) from public.creator_applications where submitted_at >= now() - interval '30 days') as creator_applications_30d,
  (select count(*) from public.ai_job_runs where started_at >= now() - interval '30 days' and status = 'succeeded') as successful_ai_runs_30d;
