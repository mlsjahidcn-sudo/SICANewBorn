-- Optional details for external university portals. Existing agency/team RLS remains in force.
-- Canonical students keep the new details in existing extra JSONB; existing birthplace,
-- marital status and sponsor email continue using their dedicated profile columns.
ALTER TABLE public.partner_students
  ADD COLUMN IF NOT EXISTS place_of_birth varchar(128),
  ADD COLUMN IF NOT EXISTS native_language varchar(100),
  ADD COLUMN IF NOT EXISTS marital_status varchar(32) CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  ADD COLUMN IF NOT EXISTS religion varchar(100),
  ADD COLUMN IF NOT EXISTS years_in_home_country numeric(5,2) CHECK (years_in_home_country BETWEEN 0 AND 150),
  ADD COLUMN IF NOT EXISTS sponsor_email varchar(255),
  ADD COLUMN IF NOT EXISTS guarantor_name varchar(200),
  ADD COLUMN IF NOT EXISTS guarantor_relationship varchar(100),
  ADD COLUMN IF NOT EXISTS guarantor_phone varchar(50),
  ADD COLUMN IF NOT EXISTS guarantor_email varchar(255);
NOTIFY pgrst, 'reload schema';
