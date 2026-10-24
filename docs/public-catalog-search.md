# Public catalog search v2

The homepage and `/programs` / `/universities` share a search box, bilingual
autocomplete, committed query URLs, and compact result rows. The original finder
is retained for rollback. Draft typing never changes full results.

## Release and rollback

The additive migrations are applied to project `wbzdwwvtbaftjxecgdxk`:

- `20261024173314_public_catalog_search_v2.sql`: indexed, server-only search RPCs.
- `20261024173433_public_catalog_search_v2_fast_facets.sql`: avoid unnecessary facet checks.
- `20261024174323_public_catalog_search_v2_relevance.sql`: combined-query relevance and explanations.
- `20261024174904_public_catalog_search_v2_missing_facets.sql`: explicit not-published facet buckets.

Set `CATALOG_SEARCH_V2=true` on the application deployment and restart/redeploy it
to enable the interface. This is a server-only variable. It is enabled in the
gitignored local `.env.local`; `.env.example` defaults to false. The capability
probe also requires the installed search RPCs and a service-role server client.
Missing migrations or missing credentials leave the original finder in place.

Rollback: set `CATALOG_SEARCH_V2=false` and restart. Leave the additive database
functions/indexes installed. No catalog data or existing columns are rewritten.

## Query and API contracts

`q` is the committed query. `search` remains accepted by the APIs. Program URL
aliases `lang` / `disc` / `uni` remain accepted alongside the long API names.
Filters, sort, and page are encoded in shareable URLs. Explicit actions push one
history entry; drafts push none. Tab switches carry only query and city.
The existing `?lang=en|zh` hreflang links change the UI locale; they are not
interpreted as teaching-language filters (`lang=English|Chinese` still works).

Existing `/api/programs` and `/api/universities` envelopes keep their mapped
records and pagination fields. V2 adds `rows`, contextual `facets`, and explicit
spelling `suggestions`. The university API retains its default page size of eight;
the public finder requests 24. RSC first paint and HTTP queries call the same
`searchPublicCatalog` function. A search failure returns 503 instead of seed data.

`GET /api/catalog/suggestions?q=…&locale=en|zh` returns at most eight suggestions:
four program searches and four university destinations. Suggestions use the same
matcher, are debounced by 250 ms, and never block submitting the search.

Matching ANDs token groups; aliases inside a group are ORed. University subject
search checks each published program independently. Ranking and pagination run
over the entire matching set in PostgreSQL, with stable name/slug tie breakers.
Missing tuition/duration does not count as zero, and CNY budgets exclude other
currencies. Tuition display preserves the original published units and ranges.

Public queries always exclude unpublished/archived programs. Administrative
visibility flags on the existing program API now require admin authorization;
the admin catalog sends its Bearer token. New RPCs are security-invoker functions
executable only by `service_role`.

## Verification and measurement

Run `scripts/verify-public-catalog-search.sql` against the installed schema. It
uses a read-only transaction to check combined-query parity, single-offering
semantics, Chinese matching, missing prices, currencies, public visibility,
pagination beyond row 1,000, spelling suggestions, and RPC permissions.

Client tests cover keyboard/IME input, debouncing, stale responses, draft filter
Apply/Reset, URL restoration, previous-results recovery, and published facts.
GA4 events include committed `search_performed`, `catalog_suggestion_select`,
`catalog_results_view` (including zero-result searches), `catalog_search_complete`
(client request duration), `catalog_search_error`, and existing result/filter events.
APIs return `Server-Timing: search;dur=…` for operational latency checks.

Search responses cache for 60 seconds and suggestions for 30 seconds. All catalog
write paths clear them, including publication/archive/import operations and
university edits. In-flight reads cannot refill caches after invalidation. Caches
are bounded and per server process; separate replicas may serve results until
their TTL expires. No external search service, AI request, or scheduled index job
is required.
