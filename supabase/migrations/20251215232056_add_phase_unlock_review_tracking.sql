/*
  # Add Phase Unlock Review Tracking

  1. New Columns
    - `phase_unlocks.reviewed_by` - UUID reference to admin who reviewed
    - `phase_unlocks.reviewed_at` - Timestamp of review
    
  2. Changes
    - Add reviewed_by column with foreign key to profiles
    - Add reviewed_at timestamp column
    - Update approved column to allow null for pending status
    
  3. Security
    - Maintain existing RLS policies
    - Only admins can update review fields
*/

-- Add reviewed_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'phase_unlocks' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE phase_unlocks ADD COLUMN reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add reviewed_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'phase_unlocks' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE phase_unlocks ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- Update approved column to allow null (pending state)
DO $$
BEGIN
  ALTER TABLE phase_unlocks ALTER COLUMN approved DROP NOT NULL;
  ALTER TABLE phase_unlocks ALTER COLUMN approved DROP DEFAULT;
END $$;