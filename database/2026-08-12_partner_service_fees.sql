-- Partner service fees enhancement
-- Business model: SICA charges partners a custom service fee per student.
-- Admin defines the amount; partner pays offline and uploads proof; admin verifies.

-- Add columns for offline payment proof and verification audit.
ALTER TABLE partner_fees
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop the old partner-managed policy if it exists (partners no longer CRUD fees).
DROP POLICY IF EXISTS "Partners can manage their own fees" ON partner_fees;

-- Partners can only view their own fees.
CREATE POLICY "Partners can view their own fees"
  ON partner_fees FOR SELECT
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Partners can update payment proof / notes on their own pending fees only.
CREATE POLICY "Partners can upload payment proof"
  ON partner_fees FOR UPDATE
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    AND status IN ('Pending', 'Rejected')
  );

-- Admin service role bypasses RLS; admin API routes use buildServiceClient().
