-- Partner Promotions module
-- Business need: admin promotes selected university+program combinations
-- for the partner portal, defines the service fee per student, visibility,
-- country restrictions, and partner-facing notes.

CREATE TABLE IF NOT EXISTS partner_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  service_fee_amount NUMERIC(12,2) NOT NULL,
  service_fee_currency VARCHAR(10) DEFAULT 'CNY',
  visibility VARCHAR(30) NOT NULL DEFAULT 'partner_only'
    CHECK (visibility IN ('partner_only', 'public_and_partner')),
  target_countries TEXT[] DEFAULT '{}',
  restricted_countries TEXT[] DEFAULT '{}',
  status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  priority INT NOT NULL DEFAULT 0,
  internal_notes TEXT,
  partner_notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_promotions_university ON partner_promotions(university_id);
CREATE INDEX IF NOT EXISTS idx_partner_promotions_program ON partner_promotions(program_id);
CREATE INDEX IF NOT EXISTS idx_partner_promotions_status ON partner_promotions(status);
CREATE INDEX IF NOT EXISTS idx_partner_promotions_visibility ON partner_promotions(visibility);
CREATE INDEX IF NOT EXISTS idx_partner_promotions_priority ON partner_promotions(priority DESC);

ALTER TABLE partner_promotions ENABLE ROW LEVEL SECURITY;

-- Admins can fully manage promotions.
CREATE POLICY "Admins can manage partner promotions"
  ON partner_promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
      AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Active partners can view active/paused promotions (country filtering is
-- applied in the application layer so it can use the partner's country).
CREATE POLICY "Partners can view partner promotions"
  ON partner_promotions FOR SELECT
  USING (
    status IN ('active', 'paused')
    AND EXISTS (
      SELECT 1 FROM partners
      WHERE partners.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS trg_partner_promotions_updated_at ON partner_promotions;
CREATE TRIGGER trg_partner_promotions_updated_at
  BEFORE UPDATE ON partner_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Link existing partner service fees to the promotion they were generated from.
ALTER TABLE partner_fees
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES partner_promotions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_partner_fees_promotion_id ON partner_fees(promotion_id);
