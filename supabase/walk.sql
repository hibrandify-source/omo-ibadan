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

-- No insert/update policies: rows are written only through add_walk_steps,
-- so the caps below can't be bypassed with a direct table update.
drop policy if exists "walk own write" on walk_steps;
drop policy if exists "walk own update" on walk_steps;

-- Capped increment: max 20k per call, 150k per week per user, and only for
-- the current Lagos week (week_key = that Monday, YYYY-MM-DD).
create or replace function add_walk_steps(p_week text, p_steps bigint, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  capped bigint := least(greatest(coalesce(p_steps, 0), 0), 20000);
  this_week text := to_char(date_trunc('week', (now() at time zone 'Africa/Lagos')), 'YYYY-MM-DD');
begin
  if auth.uid() is null then
    raise exception 'sign in first';
  end if;
  if p_week is distinct from this_week then
    raise exception 'wrong week';
  end if;
  insert into walk_steps (user_id, week_key, name, steps, updated_at)
    values (auth.uid(), p_week, left(coalesce(p_name, 'omo'), 24), capped, now())
  on conflict (user_id, week_key) do update
    set steps = least(walk_steps.steps + excluded.steps, 150000),
        name = excluded.name,
        updated_at = now();
end;
$$;

revoke execute on function add_walk_steps(text, bigint, text) from public, anon;
grant execute on function add_walk_steps(text, bigint, text) to authenticated;
