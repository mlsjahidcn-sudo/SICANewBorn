-- Prefer subject/title token matches within a combined query over parent-only matches.
create or replace function public.catalog_rank_v2(terms jsonb, phrase text, title text, title_cn text, subject text)
returns integer language sql immutable parallel safe set search_path = '' as $$
  select case
    when phrase = '' then 0
    when public.catalog_normalize_v2(title) = phrase or public.catalog_normalize_v2(title_cn) = phrase then 100
    when starts_with(public.catalog_normalize_v2(title), phrase) or starts_with(public.catalog_normalize_v2(title_cn), phrase) then 90
    when public.catalog_matches_v2(terms, coalesce(title,'') || ' ' || coalesce(title_cn,'')) then 80
    when public.catalog_matches_v2(terms, coalesce(title,'') || ' ' || coalesce(title_cn,'') || ' ' || coalesce(subject,'')) then 70
    else 50 + least(19,(select count(*)::integer from jsonb_array_elements(terms) term
      where public.catalog_matches_v2(jsonb_build_array(term),concat_ws(' ',title,title_cn,subject)))) end;
$$;

do $$
declare definition text;
begin
  select pg_get_functiondef('public.catalog_search_v2(text,jsonb,text,jsonb,text,integer,integer,boolean)'::regprocedure) into definition;
  definition := replace(definition, 'when d.relevance >= 70 then ''subject''', 'when d.relevance > 50 then ''subject''');
  execute definition;
end $$;
