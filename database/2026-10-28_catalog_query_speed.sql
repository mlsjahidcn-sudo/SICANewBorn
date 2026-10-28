-- Catalog query speed: indexes, list-projected search rows, facet aggregates.

-- GIN for university array filters used by legacy /api/universities.
create index if not exists idx_universities_disciplines_gin
  on public.universities using gin (disciplines);
create index if not exists idx_universities_tags_gin
  on public.universities using gin (tags);

-- Live program filter composite (admin + legacy queryPrograms).
create index if not exists idx_programs_live_uni_degree_lang
  on public.programs (university_slug, degree, language)
  where is_published = true and archived_at is null;

-- Projected list rows instead of to_jsonb(full row) — cuts payload for /api/* catalog GETs.
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
    public.catalog_matches_v2(terms, concat_ws(' ', p.name,p.name_cn,p.discipline,p.discipline_cn,
      p.degree,p.language,u.name,u.name_cn,u.city,u.city_cn)) as matches,
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
), documents as materialized (
  select p.slug,p.title,p.title_cn,p.attrs,p.labels,
    public.catalog_rank_v2(terms,phrase,p.title,p.title_cn,p.subject) as relevance,
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
    public.catalog_rank_v2(terms,phrase,u.name,u.name_cn,'') + case when m.count > 0 then 1 else 0 end,
    false,null::integer,null::numeric,null::smallint,u.ranking,u.qs_world_ranking,u.rating,m.count
  from public.universities u
  left join lateral (select count(*) from program_documents p where p.university_slug = u.slug and p.matches) m on true
  where catalog_kind = 'universities' and (public.catalog_matches_v2(terms,concat_ws(' ',u.name,u.name_cn,u.city,u.city_cn)) or m.count > 0)
), filtered as materialized (
  select * from documents where (filters = '{}'::jsonb or public.catalog_filters_v2(attrs,filters))
), ordered as (
  select d.*, row_number() over (order by
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
  select unnest(case when catalog_kind = 'programs'
    then array['degree','language','city','university','discipline','scholarship','intake','year','tuition','duration']
    else array['city','discipline','tag','type','rating'] end) as key where include_facets
), facet_values as (
  select f.key,v.value,
    coalesce(d.labels->f.key->>'label',v.value) as label,
    d.labels->f.key->>'labelCn' as label_cn
  from documents d cross join facet_keys f
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
  where ((filters - f.key) = '{}'::jsonb or public.catalog_filters_v2(d.attrs,filters,f.key))
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

-- SQL-side program facet aggregates (replaces paging the full table in TS).
create or replace function public.program_facets_aggregate_v1()
returns jsonb
language sql
stable
security invoker
set search_path to ''
as $$
with live as (
  select
    nullif(trim(degree), '') as degree,
    nullif(trim(language), '') as language,
    nullif(trim(discipline), '') as discipline,
    nullif(trim(discipline_cn), '') as discipline_cn,
    nullif(trim(university_slug), '') as university_slug,
    scholarship_available,
    nullif(trim(intake_season), '') as intake_season,
    intake_year,
    tuition_amount,
    duration_years,
    tuition_currency
  from public.programs
  where is_published = true and archived_at is null
), counts as (
  select
    (select count(*) from live) as total,
    (select count(*) from live where scholarship_available is true) as scholarship_yes,
    (select jsonb_agg(jsonb_build_object('value', coalesce(degree, ''), 'count', c) order by c desc, coalesce(degree, ''))
      from (select degree, count(*)::int as c from live group by degree) s) as degree,
    (select jsonb_agg(jsonb_build_object('value', coalesce(language, ''), 'count', c) order by c desc, coalesce(language, ''))
      from (select language, count(*)::int as c from live group by language) s) as language,
    (select jsonb_agg(jsonb_build_object(
        'value', coalesce(discipline, ''),
        'count', c,
        'labelCn', label_cn
      ) order by c desc, coalesce(discipline, ''))
      from (
        select discipline, count(*)::int as c,
          (array_agg(discipline_cn order by case when discipline_cn is null or discipline_cn = '' then 1 else 0 end, discipline_cn))[1] as label_cn
        from live group by discipline
      ) s) as discipline,
    (select jsonb_agg(jsonb_build_object('value', coalesce(university_slug, ''), 'count', c) order by c desc, coalesce(university_slug, ''))
      from (select university_slug, count(*)::int as c from live group by university_slug) s) as university,
    (select jsonb_agg(jsonb_build_object('value', coalesce(intake_season, ''), 'count', c) order by c desc, coalesce(intake_season, ''))
      from (select intake_season, count(*)::int as c from live group by intake_season) s) as intake_season,
    (select jsonb_agg(jsonb_build_object('value', coalesce(intake_year::text, ''), 'count', c) order by c desc, coalesce(intake_year::text, ''))
      from (select intake_year, count(*)::int as c from live group by intake_year) s) as intake_year,
    (select jsonb_build_array(
      jsonb_build_object('value', '0-20000', 'count', count(*) filter (where tuition_currency = 'CNY' and tuition_amount is not null and tuition_amount <= 20000)),
      jsonb_build_object('value', '20000-40000', 'count', count(*) filter (where tuition_currency = 'CNY' and tuition_amount between 20000 and 40000)),
      jsonb_build_object('value', '40000-', 'count', count(*) filter (where tuition_currency = 'CNY' and tuition_amount >= 40000))
    ) from live) as tuition,
    (select jsonb_build_array(
      jsonb_build_object('value', '0-1', 'count', count(*) filter (where duration_years is not null and duration_years <= 1)),
      jsonb_build_object('value', '1-2', 'count', count(*) filter (where duration_years between 1 and 2)),
      jsonb_build_object('value', '2-3', 'count', count(*) filter (where duration_years between 2 and 3)),
      jsonb_build_object('value', '3-', 'count', count(*) filter (where duration_years >= 3))
    ) from live) as duration
), city_map as (
  select u.city, u.city_cn, u.slug
  from public.universities u
  where nullif(trim(u.city), '') is not null
), city_counts as (
  select cm.city as value, sum(coalesce(uc.count, 0))::int as count,
    (array_agg(cm.city_cn order by case when cm.city_cn is null or cm.city_cn = '' then 1 else 0 end))[1] as label_cn
  from city_map cm
  left join lateral (
    select (elem->>'count')::int as count
    from jsonb_array_elements((select university from counts)) elem
    where elem->>'value' = cm.slug
  ) uc on true
  group by cm.city
)
select jsonb_build_object(
  'degree', coalesce((select degree from counts), '[]'::jsonb),
  'language', coalesce((select language from counts), '[]'::jsonb),
  'discipline', coalesce((select discipline from counts), '[]'::jsonb),
  'university', coalesce((select university from counts), '[]'::jsonb),
  'city', coalesce((
    select jsonb_agg(jsonb_build_object('value', value, 'count', count, 'labelCn', label_cn) order by count desc, value)
    from city_counts where count > 0
  ), '[]'::jsonb),
  'scholarship', jsonb_build_object(
    'yes', (select scholarship_yes from counts),
    'no', (select total - scholarship_yes from counts)
  ),
  'normalized', jsonb_build_object(
    'available', true,
    'tuitionAvailable', exists (select 1 from live where tuition_amount is not null),
    'durationAvailable', exists (select 1 from live where duration_years is not null),
    'intakeSeason', coalesce((select intake_season from counts), '[]'::jsonb),
    'intakeYear', coalesce((select intake_year from counts), '[]'::jsonb),
    'tuition', coalesce((select tuition from counts), '[]'::jsonb),
    'duration', coalesce((select duration from counts), '[]'::jsonb)
  ),
  'total', (select total from counts)
);
$$;

revoke all on function public.program_facets_aggregate_v1() from public, anon, authenticated;
grant execute on function public.program_facets_aggregate_v1() to service_role;
