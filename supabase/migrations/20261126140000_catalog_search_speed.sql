-- Catalog search speed (2026-11-26).
--
-- pg_stat_statements showed catalog_search_v2 using ~90% of all database
-- time: ~5 s per call on average, ~7 s whenever a filter was applied.
-- Results are byte-identical to the previous version (checked on 15
-- representative searches against production data); only the work done
-- to reach them changes:
--   * an empty search skips the per-row match/rank helper calls;
--   * universities count matching programs in one grouped pass instead of
--     scanning every program once per university;
--   * the full filter is evaluated once per document and reused by every
--     facet that is not itself filtered (was 10 helper calls per program);
--   * the sort only carries the columns the page needs.
-- Measured: filtered program searches 6.6-7.7 s -> 1.0-2.4 s, university
-- listings 1.5 s -> 20-50 ms, text searches on universities 1.9 s -> 0.7 s.
--
-- Also adds an index for the paged full-catalogue read
-- (order by name, slug), which was sorting all 13k rows on every page.

create index if not exists idx_programs_name_slug on public.programs (name, slug);

create or replace function public.catalog_search_v2(
  catalog_kind text,
  terms jsonb default '[]'::jsonb,
  phrase text default ''::text,
  filters jsonb default '{}'::jsonb,
  sort_key text default 'relevance'::text,
  page_number integer default 1,
  page_size integer default 24,
  include_facets boolean default true
)
returns jsonb
language sql
stable
set search_path to ''
as $function$
with program_documents as materialized (
  select p.slug::text, p.university_slug::text,
    p.name::text as title, p.name_cn::text as title_cn,
    coalesce(p.discipline,'') || ' ' || coalesce(p.discipline_cn,'') as subject,
    -- An empty search matches everything: skip the per-row helper call.
    case when jsonb_array_length(coalesce(terms,'[]'::jsonb)) = 0 then true
      else public.catalog_matches_v2(terms, concat_ws(' ', p.name,p.name_cn,p.discipline,p.discipline_cn,
        p.degree,p.language,u.name,u.name_cn,u.city,u.city_cn)) end as matches,
    jsonb_build_object('degree',p.degree,'language',coalesce(nullif(p.language,''),'To be confirmed'),
      'discipline',jsonb_build_array(p.discipline),'university',p.university_slug,'city',u.city,
      'scholarship',case when p.scholarship_available then '1' when p.scholarship_available = false then '0' end,
      'intake',p.intake_season,'year',p.intake_year,'tuition',p.tuition_amount,
      'currency',p.tuition_currency,'duration',p.duration_years) as attrs,
    jsonb_build_object('university',jsonb_build_object('label',u.name,'labelCn',u.name_cn),
      'city',jsonb_build_object('label',u.city,'labelCn',u.city_cn),
      'discipline',jsonb_build_object('label',p.discipline,'labelCn',p.discipline_cn)) as labels,
    coalesce(p.is_featured,false) as featured, p.featured_rank,
    p.tuition_amount as tuition, p.intake_year as intake_year,
    u.name::text as university_name,u.name_cn::text as university_name_cn,u.logo::text,u.city::text,u.city_cn::text
  from public.programs p left join public.universities u on u.slug = p.university_slug
  where p.is_published = true and p.archived_at is null
), university_program_matches as (
  -- One grouped pass instead of a per-university scan of every program.
  -- Lean on purpose: only built for the universities listing.
  select p.university_slug::text as university_slug, count(*) as count
  from public.programs p left join public.universities u on u.slug = p.university_slug
  where catalog_kind = 'universities' and p.is_published = true and p.archived_at is null
    and (jsonb_array_length(coalesce(terms,'[]'::jsonb)) = 0
      or public.catalog_matches_v2(terms, concat_ws(' ', p.name,p.name_cn,p.discipline,p.discipline_cn,
        p.degree,p.language,u.name,u.name_cn,u.city,u.city_cn)))
  group by p.university_slug
), documents as materialized (
  select p.slug,p.title,p.title_cn,p.attrs,p.labels,
    case when phrase = '' then 0 else public.catalog_rank_v2(terms,phrase,p.title,p.title_cn,p.subject) end as relevance,
    p.featured,p.featured_rank,p.tuition,p.intake_year,
    null::integer as ranking,null::integer as qs_world,null::numeric as rating,
    0::bigint as matching_program_count
  from program_documents p where catalog_kind = 'programs' and p.matches
  union all
  select u.slug::text,u.name::text,u.name_cn::text,
    jsonb_build_object('city',u.city,'discipline',to_jsonb(u.disciplines),'tag',to_jsonb(u.tags),
      'type',case when lower(u.type) like 'public%' then 'Public' when lower(u.type) like 'private%' then 'Private' else u.type end,
      'rating',u.rating),
    jsonb_build_object('city',jsonb_build_object('label',u.city,'labelCn',u.city_cn)),
    (case when phrase = '' then 0 else public.catalog_rank_v2(terms,phrase,u.name,u.name_cn,'') end)
      + case when coalesce(m.count,0) > 0 then 1 else 0 end,
    false,null::integer,null::numeric,null::smallint,u.ranking,u.qs_world_ranking,u.rating,coalesce(m.count,0)::bigint
  from public.universities u
  left join university_program_matches m on m.university_slug = u.slug
  where catalog_kind = 'universities'
    and (jsonb_array_length(coalesce(terms,'[]'::jsonb)) = 0
      or public.catalog_matches_v2(terms,concat_ws(' ',u.name,u.name_cn,u.city,u.city_cn))
      or coalesce(m.count,0) > 0)
), flagged as materialized (
  -- Evaluate the full filter once per document; facets reuse it.
  select d.*, (filters = '{}'::jsonb or public.catalog_filters_v2(d.attrs,filters)) as passes
  from documents d
), filtered as materialized (
  select * from flagged where passes
), ordered as (
  -- Only the columns the page needs, so the 13k-row sort stays narrow.
  select d.slug, d.relevance, d.matching_program_count, row_number() over (order by
    case when sort_key = 'relevance' then relevance end desc,
    case when sort_key = 'default' then featured end desc,
    case when sort_key in ('default','featured_rank') then featured_rank end asc nulls last,
    case when sort_key = 'tuition' then tuition end asc nulls last,
    case when sort_key = 'intake' then intake_year end desc nulls last,
    case when sort_key = 'ranking' then nullif(ranking,0) end asc nulls last,
    case when sort_key = 'qsWorld' then nullif(qs_world,0) end asc nulls last,
    case when sort_key = 'rating' then rating end desc nulls last,
    lower(title),slug) as position
  from filtered d
), page_rows as (
  select * from ordered where position > (greatest(1,page_number)-1)::bigint * least(500,greatest(1,page_size))
    and position <= greatest(1,page_number)::bigint * least(500,greatest(1,page_size))
), facet_keys as (
  select key,
    -- A facet that is not itself filtered sees exactly the full filter result.
    not (filters ? key)
      and not (key = 'tuition' and (filters ? 'tuition_min' or filters ? 'tuition_max'))
      and not (key = 'duration' and (filters ? 'duration_min' or filters ? 'duration_max')) as reuse_passes
  from unnest(case when catalog_kind = 'programs'
    then array['degree','language','city','university','discipline','scholarship','intake','year','tuition','duration']
    else array['city','discipline','tag','type','rating'] end) as key where include_facets
), facet_values as (
  select f.key,v.value,
    coalesce(d.labels->f.key->>'label',v.value) as label,
    d.labels->f.key->>'labelCn' as label_cn
  from flagged d cross join facet_keys f
  cross join lateral jsonb_array_elements_text(case
    when f.key = 'tuition' then to_jsonb(array_remove(array[
      case when (d.attrs->>'currency') = 'CNY' and (d.attrs->>'tuition')::numeric <= 20000 then '0-20000' end,
      case when (d.attrs->>'currency') = 'CNY' and (d.attrs->>'tuition')::numeric between 20000 and 40000 then '20000-40000' end,
      case when (d.attrs->>'currency') = 'CNY' and (d.attrs->>'tuition')::numeric >= 40000 then '40000-' end],null))
    when f.key = 'duration' then to_jsonb(array_remove(array[
      case when (d.attrs->>'duration')::numeric <= 1 then '0-1' end,
      case when (d.attrs->>'duration')::numeric between 1 and 2 then '1-2' end,
      case when (d.attrs->>'duration')::numeric between 2 and 3 then '2-3' end,
      case when (d.attrs->>'duration')::numeric >= 3 then '3-' end],null))
    when f.key = 'rating' then to_jsonb(array_remove(array[
      case when (d.attrs->>'rating')::numeric >= 4.5 then '4.5' end,
      case when (d.attrs->>'rating')::numeric >= 4.7 then '4.7' end,
      case when (d.attrs->>'rating')::numeric >= 4.8 then '4.8' end,
      case when (d.attrs->>'rating')::numeric >= 4.9 then '4.9' end],null))
    when jsonb_typeof(d.attrs->f.key) = 'array' then d.attrs->f.key
    else jsonb_build_array(coalesce(nullif(d.attrs->>f.key,''),'__none__')) end) v(value)
  where ((filters - f.key) = '{}'::jsonb
    or case when f.reuse_passes then d.passes else public.catalog_filters_v2(d.attrs,filters,f.key) end)
), facet_counts as (
  select key,coalesce(value,'__none__') as value,max(label) as label,max(label_cn) as label_cn,count(*) as count
  from facet_values group by key,value
), facets as (
  select key,jsonb_agg(jsonb_build_object('value',value,'label',label,'labelCn',label_cn,'count',count) order by label,value) as options
  from facet_counts group by key
), results as (
  select d.position, jsonb_build_object(
    'slug', p.slug, 'name', p.name, 'name_cn', p.name_cn, 'university_slug', p.university_slug,
    'degree', p.degree, 'discipline', p.discipline, 'discipline_cn', p.discipline_cn,
    'language', p.language, 'duration', p.duration, 'duration_cn', p.duration_cn,
    'tuition', p.tuition, 'scholarship_available', p.scholarship_available,
    'intake', p.intake, 'intake_cn', p.intake_cn,
    'is_featured', p.is_featured, 'is_published', p.is_published,
    'archived_at', p.archived_at, 'featured_rank', p.featured_rank,
    'university_name', u.name, 'university_name_cn', u.name_cn,
    'logo', u.logo, 'city', u.city, 'city_cn', u.city_cn,
    'match_reason', case
      when d.relevance >= 80 then 'title' when d.relevance > 50 then 'subject'
      when public.catalog_matches_v2(terms, concat_ws(' ', u.city, u.city_cn)) then 'location'
      else 'university' end
  ) as row
  from page_rows d
  join public.programs p on p.slug = d.slug
  left join public.universities u on u.slug = p.university_slug
  where catalog_kind = 'programs'
  union all
  select d.position, jsonb_build_object(
    'slug', u.slug, 'name', u.name, 'name_cn', u.name_cn,
    'city', u.city, 'city_cn', u.city_cn, 'ranking', u.ranking, 'rating', u.rating,
    'type', u.type, 'type_cn', u.type_cn, 'disciplines', u.disciplines,
    'image', u.image, 'logo', u.logo, 'qs_ranking', u.qs_ranking,
    'qs_world_ranking', u.qs_world_ranking, 'tags', u.tags, 'tags_cn', u.tags_cn,
    'accommodation_cost', u.accommodation_cost, 'accommodation_cost_cn', u.accommodation_cost_cn,
    'matching_program_count', d.matching_program_count,
    'match_reason', case
      when d.relevance >= 80 then 'title'
      when d.matching_program_count > 0 then 'subject'
      else 'location' end
  ) as row
  from page_rows d
  join public.universities u on u.slug = d.slug
  where catalog_kind = 'universities'
)
select jsonb_build_object(
  'version', 2,
  'rows', coalesce((select jsonb_agg(row order by position) from results), '[]'),
  'total', (select count(*) from filtered),
  'facets', coalesce((select jsonb_object_agg(key, options) from facets), '{}')
);
$function$;

revoke all on function public.catalog_search_v2(text, jsonb, text, jsonb, text, integer, integer, boolean) from public, anon, authenticated;
grant execute on function public.catalog_search_v2(text, jsonb, text, jsonb, text, integer, integer, boolean) to service_role;
