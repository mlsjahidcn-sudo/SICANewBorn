-- Read-only regression checks against an installed catalog search migration.
begin transaction isolation level repeatable read read only;
do $$
declare combined jsonb; structured jsonb; results jsonb; public_count bigint;
begin
  combined := public.catalog_search_v2('programs','[["computer"],["science"],["beijing"]]','computer science beijing','{}','relevance',1,500,false);
  structured := public.catalog_search_v2('programs','[["computer"],["science"]]','computer science','{"city":"Beijing"}','relevance',1,500,false);
  assert combined->>'total' = structured->>'total', 'Combined search differs from subject + city filter';
  assert (select array_agg(r->>'slug' order by r->>'slug') from jsonb_array_elements(combined->'rows') r)
    = (select array_agg(r->>'slug' order by r->>'slug') from jsonb_array_elements(structured->'rows') r), 'Combined search returns different programs';
  assert public.catalog_matches_v2('[["english"],["computer"],["science"]]','English Computer Science Beijing'), 'Combined matching failed';
  assert not (public.catalog_matches_v2('[["english"],["computer"],["science"]]','English Business')
    or public.catalog_matches_v2('[["english"],["computer"],["science"]]','Chinese Computer Science')), 'Combined separate offerings';
  assert public.catalog_matches_v2('[["computer science","计算机"]]','Computer Science'), 'CS alias failed';
  assert public.catalog_matches_v2('[["清华"]]','清华大学'), 'Chinese substring failed';
  assert not public.catalog_filters_v2('{"tuition":null,"currency":"CNY"}','{"tuition":"0-20000"}'), 'Missing tuition treated as zero';
  assert not public.catalog_filters_v2('{"tuition":1000,"currency":"USD"}','{"tuition":"0-20000"}'), 'Mixed-currency budget';
  assert public.catalog_filters_v2('{"discipline":[null]}','{"discipline":"__none__"}'), 'Missing discipline bucket';
  assert public.catalog_filters_v2('{"year":null}','{"year":"__none__"}'), 'Missing intake-year bucket';
  results := public.catalog_search_v2('programs','[]','','{}','relevance',43,24,false);
  select count(*) into public_count from public.programs where is_published and archived_at is null;
  assert (results->>'total')::bigint = public_count, 'Incorrect public count';
  if public_count >= 1032 then assert jsonb_array_length(results->'rows') = 24, 'Relevance pagination truncates at 1000'; end if;
  assert not exists (select 1 from jsonb_array_elements(results->'rows') r where r->>'is_published' <> 'true' or r->>'archived_at' is not null), 'Nonpublic row in results';
  assert not has_function_privilege('anon','public.catalog_search_v2(text,jsonb,text,jsonb,text,integer,integer,boolean)','execute'), 'RPC publicly executable';
  assert jsonb_array_length(public.catalog_spellings_v2('compuer science','programs','en')) > 0, 'No spelling suggestion';
end $$;
rollback;
