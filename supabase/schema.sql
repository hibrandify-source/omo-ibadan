-- Omo Ibadan — Supabase schema (Phase 1: accounts + cloud saves + global turf)
-- Run this once in Supabase Dashboard → SQL Editor.
-- Free tier is enough. No secrets needed here.

-- 1) Profiles: one row per auth user, owns their own row.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  arch_id text not null default 'ui-student',
  gender text not null default 'okunrin',
  look jsonb not null default '{"skin":1,"top":1,"topEx":null,"gear":null}'::jsonb,
  wallet jsonb not null default '{"ola":0,"iwa":50,"energy":80}'::jsonb,
  progress jsonb not null default '{}'::jsonb,
  hoods jsonb not null default '{}'::jsonb,
  my_hood text not null default 'bodija',
  wardrobe text[] not null default '{}',
  equipped text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "own profile read" on profiles;
create policy "own profile read"
  on profiles for select using (auth.uid() = id);

drop policy if exists "own profile write" on profiles;
create policy "own profile write"
  on profiles for insert with check (auth.uid() = id);

drop policy if exists "own profile update" on profiles;
create policy "own profile update"
  on profiles for update using (auth.uid() = id);

-- 2) Global hood turf: one row per hood, readable by everyone.
create table if not exists hood_totals (
  hood text primary key,
  total bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into hood_totals (hood, total) values
  ('bodija', 12400), ('agbowo', 15200), ('challenge', 9800),
  ('iwo-road', 18600), ('ojoo', 6400), ('beere', 11700)
on conflict (hood) do nothing;

alter table hood_totals enable row level security;

drop policy if exists "turf public read" on hood_totals;
create policy "turf public read"
  on hood_totals for select using (true);

-- 3) Secure increment: anyone authed can add (never subtract) turf.
create or replace function add_turf(p_hood text, p_amount bigint)
returns void
language plpgsql
security definer
as $$
begin
  if p_amount < 0 or p_amount > 100000 then
    raise exception 'bad amount';
  end if;
  insert into hood_totals (hood, total, updated_at)
    values (p_hood, p_amount, now())
  on conflict (hood) do update
      set total = hood_totals.total + excluded.total,
          updated_at = now();
end;
$$;

-- Presence needs no table (Realtime presence channels).
-- In Dashboard → Database → Replication, enable nothing extra.
-- In Dashboard → Authentication → Providers, enable Email (OTP) at minimum.
