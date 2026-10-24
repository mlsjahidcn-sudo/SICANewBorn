-- Additive public catalog search. Called by the server only; no new public grants.
create extension if not exists pg_trgm with schema extensions;

create or replace function public.catalog_normalize_v2(value text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select trim(regexp_replace(lower(coalesce(value, '')), '[^[:alnum:]]+', ' ', 'g'));
$$;

create or replace function public.catalog_matches_v2(terms jsonb, document text)
returns boolean language sql immutable parallel safe set search_path = '' as $$
  select not exists (
    select 1 from jsonb_array_elements(coalesce(terms, '[]')) term
    where not exists (
      select 1 from jsonb_array_elements_text(term) alternative
      where strpos(public.catalog_normalize_v2(document), alternative) > 0
    )
  );
$$;

create or replace function public.catalog_filters_v2(a jsonb, filters jsonb, except_key text default '')
returns boolean language sql immutable parallel safe set search_path = '' as $$
  select coalesce(bool_and(coalesce(case
    when key = 'discipline' or key = 'tag' then a->key ? value
    when key = 'intake' then a->>key = value or (value in ('September','March') and a->>key = 'Both')
    when key = 'rating' then (a->>key)::numeric >= value::numeric
    when key = 'tuition' then (a->>'currency') = 'CNY' and case value
      when '0-20000' then (a->>'tuition')::numeric <= 20000
      when '20000-40000' then (a->>'tuition')::numeric between 20000 and 40000
      when '40000-' then (a->>'tuition')::numeric >= 40000 else false end
    when key = 'duration' then case value
      when '0-1' then (a->>'duration')::numeric <= 1
      when '1-2' then (a->>'duration')::numeric between 1 and 2
      when '2-3' then (a->>'duration')::numeric between 2 and 3
      when '3-' then (a->>'duration')::numeric >= 3 else false end
    when key = 'tuition_min' then (a->>'currency') = 'CNY' and (a->>'tuition')::numeric >= value::numeric
    when key = 'tuition_max' then (a->>'currency') = 'CNY' and (a->>'tuition')::numeric <= value::numeric
    when key = 'duration_min' then (a->>'duration')::numeric >= value::numeric
    when key = 'duration_max' then (a->>'duration')::numeric <= value::numeric
    when value = '__none__' then a->>key is null or a->>key = ''
    else a->>key = value end, false)), true)
  from jsonb_each_text(coalesce(filters, '{}'))
  where value <> '' and key <> except_key
    and not (except_key = 'tuition' and key in ('tuition_min','tuition_max'))
    and not (except_key = 'duration' and key in ('duration_min','duration_max'));
$$;

create or replace function public.catalog_rank_v2(terms jsonb, phrase text, title text, title_cn text, subject text)
returns integer language sql immutable parallel safe set search_path = '' as $$
  select case
    when phrase = '' then 0
    when public.catalog_normalize_v2(title) = phrase or public.catalog_normalize_v2(title_cn) = phrase then 100
    when starts_with(public.catalog_normalize_v2(title), phrase) or starts_with(public.catalog_normalize_v2(title_cn), phrase) then 90
    when public.catalog_matches_v2(terms, coalesce(title,'') || ' ' || coalesce(title_cn,'')) then 80
    when public.catalog_matches_v2(terms, coalesce(title,'') || ' ' || coalesce(title_cn,'') || ' ' || coalesce(subject,'')) then 70
    else 50 end;
$$;

-- Trigrams accelerate title lookup and spelling suggestions. No copied catalog or refresh job.
create index if not exists programs_catalog_title_trgm_v2 on public.programs using gin
  (public.catalog_normalize_v2(name || ' ' || coalesce(name_cn,'')) extensions.gin_trgm_ops)
  where is_published = true and archived_at is null;
create index if not exists universities_catalog_title_trgm_v2 on public.universities using gin
  (public.catalog_normalize_v2(name || ' ' || coalesce(name_cn,'')) extensions.gin_trgm_ops);
create index if not exists programs_catalog_university_v2 on public.programs (university_slug)
  where is_published = true and archived_at is null;

create or replace function public.catalog_search_version_v2()
returns integer language sql stable security invoker set search_path = '' as $$ select 2; $$;

create or replace function public.catalog_search_v2(
  catalog_kind text, terms jsonb default '[]', phrase text default '', filters jsonb default '{}',
  sort_key text default 'relevance', page_number integer default 1, page_size integer default 24,
  include_facets boolean default true
)
returns jsonb language sql stable security invoker set search_path = '' as $$
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
  select * from documents where public.catalog_filters_v2(attrs,filters)
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
  where public.catalog_filters_v2(d.attrs,filters,f.key)
), facet_counts as (
  select key,coalesce(value,'__none__') as value,max(label) as label,max(label_cn) as label_cn,count(*) as count
  from facet_values group by key,value
), facets as (
  select key,jsonb_agg(jsonb_build_object('value',value,'label',label,'labelCn',label_cn,'count',count) order by label,value) as options
  from facet_counts group by key
), results as (
  select d.position,to_jsonb(p) || jsonb_build_object('university_name',u.name,'university_name_cn',u.name_cn,
    'logo',u.logo,'city',u.city,'city_cn',u.city_cn,'match_reason',case
      when d.relevance >= 80 then 'title' when d.relevance >= 70 then 'subject'
      when public.catalog_matches_v2(terms,concat_ws(' ',u.city,u.city_cn)) then 'location' else 'university' end) as row
  from page_rows d join public.programs p on p.slug = d.slug
  left join public.universities u on u.slug = p.university_slug where catalog_kind = 'programs'
  union all
  select d.position,to_jsonb(u) || jsonb_build_object('matching_program_count',d.matching_program_count,
    'match_reason',case when d.relevance >= 80 then 'title' when d.matching_program_count > 0 then 'subject' else 'location' end)
  from page_rows d join public.universities u on u.slug = d.slug where catalog_kind = 'universities'
)
select jsonb_build_object('version',2,'rows',coalesce((select jsonb_agg(row order by position) from results),'[]'),
  'total',(select count(*) from filtered),'facets',coalesce((select jsonb_object_agg(key,options) from facets),'{}'));
$$;

create or replace function public.catalog_spellings_v2(query text, catalog_kind text, locale text default 'en')
returns jsonb language sql stable security invoker set search_path = '' as $$
  with candidates as (
    select distinct case when locale = 'zh' and nullif(name_cn,'') is not null then name_cn else name end::text as title
    from public.programs where catalog_kind = 'programs' and is_published = true and archived_at is null
      and public.catalog_normalize_v2(name || ' ' || coalesce(name_cn,'')) operator(extensions.%>) public.catalog_normalize_v2(query)
    union
    select case when locale = 'zh' and nullif(name_cn,'') is not null then name_cn else name end::text
    from public.universities where catalog_kind = 'universities'
      and public.catalog_normalize_v2(name || ' ' || coalesce(name_cn,'')) operator(extensions.%>) public.catalog_normalize_v2(query)
  ), ranked as (
    select title,extensions.word_similarity(public.catalog_normalize_v2(query),public.catalog_normalize_v2(title)) as score
    from candidates where length(query) >= 3
    order by score desc,title limit 3
  ) select coalesce(jsonb_agg(title order by score desc,title),'[]') from ranked;
$$;

-- These helpers run with the server's existing service-role connection only.
revoke all on function public.catalog_normalize_v2(text) from public,anon,authenticated;
revoke all on function public.catalog_matches_v2(jsonb,text) from public,anon,authenticated;
revoke all on function public.catalog_filters_v2(jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.catalog_rank_v2(jsonb,text,text,text,text) from public,anon,authenticated;
revoke all on function public.catalog_search_version_v2() from public,anon,authenticated;
revoke all on function public.catalog_search_v2(text,jsonb,text,jsonb,text,integer,integer,boolean) from public,anon,authenticated;
revoke all on function public.catalog_spellings_v2(text,text,text) from public,anon,authenticated;
grant execute on function public.catalog_normalize_v2(text),public.catalog_matches_v2(jsonb,text),
  public.catalog_filters_v2(jsonb,jsonb,text),public.catalog_rank_v2(jsonb,text,text,text,text),
  public.catalog_search_version_v2(),public.catalog_search_v2(text,jsonb,text,jsonb,text,integer,integer,boolean),
  public.catalog_spellings_v2(text,text,text) to service_role;
