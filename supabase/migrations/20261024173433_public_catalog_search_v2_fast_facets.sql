-- Avoid evaluating per-row filter functions for an empty filter set (the common path).
do $$
declare definition text;
begin
  select pg_get_functiondef('public.catalog_search_v2(text,jsonb,text,jsonb,text,integer,integer,boolean)'::regprocedure) into definition;
  definition := replace(definition,
    'where public.catalog_filters_v2(attrs,filters)',
    'where (filters = ''{}''::jsonb or public.catalog_filters_v2(attrs,filters))');
  definition := replace(definition,
    'where public.catalog_filters_v2(d.attrs,filters,f.key)',
    'where ((filters - f.key) = ''{}''::jsonb or public.catalog_filters_v2(d.attrs,filters,f.key))');
  execute definition;
end $$;
