-- MindWeave AI operations admins. No public read policy is created.
create table if not exists public.ai_ops_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.ai_ops_admins enable row level security;

-- Seed the verified platform owner used to manage this deployment.
insert into public.ai_ops_admins (user_id)
select id from auth.users where lower(email) = lower('schaik462@gmail.com')
on conflict (user_id) do nothing;
