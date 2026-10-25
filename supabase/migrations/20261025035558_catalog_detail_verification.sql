-- Staff-authored evidence for public catalog details. No values are inferred or backfilled.
ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS detail_verification jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS detail_verification jsonb;
COMMENT ON COLUMN public.universities.detail_verification IS 'Source URL/date, named intake/year with status/deadline, funding details, and ranking source/year. Managed through authenticated admin catalog forms.';
COMMENT ON COLUMN public.programs.detail_verification IS 'Source URL/date, named intake/year with status/deadline, and funding details. Managed through authenticated admin catalog forms.';
