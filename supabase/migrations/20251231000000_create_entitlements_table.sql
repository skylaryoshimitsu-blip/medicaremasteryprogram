/*
  # Create Entitlements Table

  1. New Tables
    - `entitlements`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users.id
      - `has_active_access` (boolean) - Whether user has active program access
      - `payment_verified` (boolean) - Whether payment has been verified
      - `stripe_payment_intent_id` (text) - Stripe payment intent ID for tracking
      - `stripe_customer_id` (text) - Stripe customer ID
      - `created_at` (timestamptz) - When entitlement was created
      - `updated_at` (timestamptz) - Last update timestamp
      - `expires_at` (timestamptz) - Optional expiration date

  2. Security
    - Enable RLS on `entitlements` table
    - Add policy for users to read their own entitlement data
    - Add policy for authenticated users to view their access status
    - Restrict write access to service role only (webhooks)

  3. Indexes
    - Index on user_id for fast lookups
    - Index on stripe_payment_intent_id for webhook processing
*/

CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_active_access boolean DEFAULT false NOT NULL,
  payment_verified boolean DEFAULT false NOT NULL,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_stripe_payment_intent ON entitlements(stripe_payment_intent_id);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entitlement"
  ON entitlements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert entitlements"
  ON entitlements
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update entitlements"
  ON entitlements
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_entitlement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entitlements_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_entitlement_updated_at();
