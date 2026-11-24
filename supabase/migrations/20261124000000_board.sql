-- Parol · tonight's board (Phase 9).
-- Run once in the Supabase SQL editor (or `npx supabase db push`).
--
-- Players have no accounts: each device keeps a random secret, and only its SHA-256 hash is stored.
-- The tables are closed to the browser. The game reads through board() and names itself through set_name();
-- only the submit-run edge function (service role) can call record_run(), after replaying the run's taps.

create extension if not exists pgcrypto with schema extensions;

-- ── Tables ───────────────────────────────────────────────────────────────────────────────────────────────

create table public.players (
  id uuid primary key default gen_random_uuid(),
  secret_hash text not null unique,
  -- Up to 16 letters or numbers, single spaces between words.
  name text check (name is null or (char_length(name) <= 16 and name ~ '^[[:alnum:]]+( [[:alnum:]]+)*$')),
  created_at timestamptz not null default now()
);

-- Every checked run, with its taps, so any score can be replayed again later.
create table public.runs (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.players (id) on delete cascade,
  day date not null,
  rings integer not null check (rings >= 0),
  perfects integer not null check (perfects >= 0),
  inputs jsonb not null,
  created_at timestamptz not null default now()
);
create index runs_player_day on public.runs (player_id, day);

-- Each player's best run per Manila day: what the board ranks.
create table public.daily_best (
  day date not null,
  player_id uuid not null references public.players (id) on delete cascade,
  rings integer not null check (rings >= 0),
  reached_at timestamptz not null default now(),
  primary key (day, player_id)
);
create index daily_best_rank on public.daily_best (day, rings desc, reached_at);

alter table public.players enable row level security;
alter table public.runs enable row level security;
alter table public.daily_best enable row level security;
-- No policies on purpose: nothing reaches these tables from the browser except through the functions below.
revoke all on public.players, public.runs, public.daily_best from anon, authenticated;

-- ── Functions ────────────────────────────────────────────────────────────────────────────────────────────

-- The player behind a device secret, created on first use.
create function public.ensure_player(p_secret text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_hash text;
  v_id uuid;
begin
  if p_secret is null or char_length(p_secret) not between 32 and 64 then
    raise exception 'Bad player secret' using errcode = '22023';
  end if;
  v_hash := encode(extensions.digest(p_secret, 'sha256'), 'hex');
  insert into public.players (secret_hash) values (v_hash) on conflict (secret_hash) do nothing;
  select id into v_id from public.players where secret_hash = v_hash;
  return v_id;
end $$;

-- A score's rank on a day: ties share a rank.
create function public.rank_on(p_day date, p_rings integer) returns integer
language sql stable set search_path = '' as $$
  select count(*)::integer + 1 from public.daily_best where day = p_day and rings > p_rings
$$;

-- Records a run the edge function has already replayed. Returns the player's best, rank, rank before, and total.
create function public.record_run(p_secret text, p_day date, p_rings integer, p_perfects integer, p_inputs jsonb)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := public.ensure_player(p_secret);
  v_before integer;
  v_before_rank integer;
  v_best integer;
begin
  select rings into v_before from public.daily_best where day = p_day and player_id = v_player;
  if v_before is not null then
    v_before_rank := public.rank_on(p_day, v_before);
  end if;

  insert into public.runs (player_id, day, rings, perfects, inputs)
  values (v_player, p_day, p_rings, p_perfects, p_inputs);

  insert into public.daily_best (day, player_id, rings) values (p_day, v_player, p_rings)
  on conflict (day, player_id) do update set rings = excluded.rings, reached_at = now()
  where public.daily_best.rings < excluded.rings;

  v_best := greatest(coalesce(v_before, p_rings), p_rings);
  return jsonb_build_object(
    'rings', v_best,
    'rank', public.rank_on(p_day, v_best),
    'before', v_before_rank,
    'total', (select count(*) from public.daily_best where day = p_day)
  );
end $$;

-- Sets the name shown on the board: up to 16 letters, numbers or spaces, with a small word filter.
create function public.set_name(p_secret text, p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if char_length(v_name) > 16 or v_name !~ '^[[:alnum:]]+( [[:alnum:]]+)*$' then
    raise exception 'Use up to 16 letters, numbers or spaces' using errcode = '22023';
  end if;
  -- shortcut: a short English and Tagalog list; upgrade to a proper filter if names get reported.
  if lower(replace(v_name, ' ', '')) ~ '(fuck|shit|bitch|cunt|nigg|putang|tangina|kantot|pekpek|burat|gago)' then
    raise exception 'Please pick another name' using errcode = '22023';
  end if;
  -- Fixed in 20261124000100_fix_set_name.sql: the player must exist before this update can see it.
  update public.players set name = v_name where id = public.ensure_player(p_secret);
  return v_name;
end $$;

-- A day's board: the total, the top 10, and (given the device secret) your own rank and name.
create function public.board(p_day date, p_secret text default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_player uuid;
  v_me jsonb;
begin
  if p_secret is not null then
    select id into v_player from public.players where secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex');
  end if;

  select jsonb_build_object(
    'name', p.name,
    'rings', b.rings,
    'rank', case when b.rings is null then null else public.rank_on(p_day, b.rings) end
  ) into v_me
  from public.players p
  left join public.daily_best b on b.player_id = p.id and b.day = p_day
  where p.id = v_player;

  return jsonb_build_object(
    'total', (select count(*) from public.daily_best where day = p_day),
    'top', coalesce((
      select jsonb_agg(jsonb_build_object('rank', t.rank, 'name', t.name, 'rings', t.rings, 'me', coalesce(t.player_id = v_player, false))
                       order by t.rings desc, t.reached_at)
      from (
        select b.player_id, b.rings, b.reached_at, p.name, public.rank_on(p_day, b.rings) as rank
        from public.daily_best b
        join public.players p on p.id = b.player_id
        where b.day = p_day
        order by b.rings desc, b.reached_at
        limit 10
      ) t
    ), '[]'::jsonb),
    'me', v_me
  );
end $$;

-- ── Who may call what ────────────────────────────────────────────────────────────────────────────────────

revoke execute on function
  public.ensure_player(text),
  public.rank_on(date, integer),
  public.record_run(text, date, integer, integer, jsonb),
  public.set_name(text, text),
  public.board(date, text)
from public, anon, authenticated;

grant execute on function public.board(date, text), public.set_name(text, text) to anon, authenticated;
grant execute on function public.record_run(text, date, integer, integer, jsonb) to service_role;
