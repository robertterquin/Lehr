-- Parol · fix: a brand-new player's first name was lost.
-- set_name() created the player inside the UPDATE's own WHERE, and an UPDATE can't see a row inserted during
-- itself, so it changed nothing (and still answered with the name). Now the player is made first.
-- Run once in the Supabase SQL editor, after 20261124000000_board.sql. Its grants carry over.

create or replace function public.set_name(p_secret text, p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_player uuid;
begin
  if char_length(v_name) > 16 or v_name !~ '^[[:alnum:]]+( [[:alnum:]]+)*$' then
    raise exception 'Use up to 16 letters, numbers or spaces' using errcode = '22023';
  end if;
  -- shortcut: a short English and Tagalog list; upgrade to a proper filter if names get reported.
  if lower(replace(v_name, ' ', '')) ~ '(fuck|shit|bitch|cunt|nigg|putang|tangina|kantot|pekpek|burat|gago)' then
    raise exception 'Please pick another name' using errcode = '22023';
  end if;
  v_player := public.ensure_player(p_secret);
  update public.players set name = v_name where id = v_player;
  return v_name;
end $$;
