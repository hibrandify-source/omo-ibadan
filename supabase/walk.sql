-- Omo Ibadan — weekly walkers board (take-a-walk rewards).
-- Run in Supabase Dashboard → SQL Editor (after schema.sql).
-- Anti-spoof is enforced client-side (speed/accuracy caps) AND here
-- (per-call cap + weekly sanity cap).

create table if not exists walk_steps (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_key text not null,
  name text not null default 'omo',
  steps bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_key)
);

alter table walk_steps enable row level security;

drop policy if exists "walk public read" on walk_steps;
create policy "walk public read"
  on walk_steps for select using (true);

drop policy if exists "walk own write" on walk_steps;
create policy "walk own write"
  on walk_steps for insert with check (auth.uid() = user_id);

drop policy if exists "walk own update" on walk_steps;
create policy "walk own update"
  on walk_steps for update using (auth.uid() = user_id);

-- Capped increment: max 20k per call, 150k per week per user.
create or replace function add_walk_steps(p_week text, p_steps bigint, p_name text)
returns void
language plpgsql
security definer
as $$
declare
  capped bigint := least(greatest(p_steps, 0), 20000);
begin
  insert into walk_steps (user_id, week_key, name, steps, updated_at)
    values (auth.uid(), p_week, left(coalesce(p_name, 'omo'), 24), capped, now())
  on conflict (user_id, week_key) do update
    set steps = least(walk_steps.steps + excluded.steps, 150000),
        name = excluded.name,
        updated_at = now();
end;
$$;
