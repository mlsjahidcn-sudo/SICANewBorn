-- A missing discipline is an array containing null; scalar and array buckets
-- must both honor the public __none__ URL sentinel.
create or replace function public.catalog_filters_v2(a jsonb, filters jsonb, except_key text default '')
returns boolean language sql immutable parallel safe set search_path = '' as $$
  select coalesce(bool_and(coalesce(case
    when value = '__none__' then a->key is null or a->key = 'null'::jsonb or a->>key = '' or
      case when jsonb_typeof(a->key) = 'array' then jsonb_array_length(a->key) = 0 or a->key @> '[null]'::jsonb or a->key @> '[""]'::jsonb else false end
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
    else a->>key = value end, false)), true)
  from jsonb_each_text(coalesce(filters, '{}'))
  where value <> '' and key <> except_key
    and not (except_key = 'tuition' and key in ('tuition_min','tuition_max'))
    and not (except_key = 'duration' and key in ('duration_min','duration_max'));
$$;
