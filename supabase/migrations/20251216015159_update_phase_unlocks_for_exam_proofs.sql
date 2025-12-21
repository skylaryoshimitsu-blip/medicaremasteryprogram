/*
  # Update Phase Unlocks for Exam Proof Uploads

  1. Purpose
    - Add status enum for exam proof review workflow
    - Track rejection reason for better student feedback
    - Maintain backward compatibility with existing boolean approved field

  2. Changes
    - Add status column (pending, approved, rejected)
    - Add rejection_reason text column
    - Add function to sync status with approved boolean
    - Ensure screenshot_url can store PDF or image URLs

  3. Security
    - Maintain existing RLS policies
    - Status field follows same access rules as approved field
*/

-- Create status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_proof_status') THEN
    CREATE TYPE exam_proof_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Add status column to phase_unlocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'phase_unlocks' AND column_name = 'status'
  ) THEN
    ALTER TABLE phase_unlocks ADD COLUMN status exam_proof_status DEFAULT 'pending';
  END IF;
END $$;

-- Add rejection_reason column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'phase_unlocks' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE phase_unlocks ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Sync existing approved values to status
UPDATE phase_unlocks
SET status = CASE
  WHEN approved = true THEN 'approved'::exam_proof_status
  WHEN approved = false THEN 'rejected'::exam_proof_status
  ELSE 'pending'::exam_proof_status
END
WHERE status = 'pending';

-- Create function to keep approved and status in sync
CREATE OR REPLACE FUNCTION sync_phase_unlock_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes, update approved accordingly
  IF NEW.status = 'approved' THEN
    NEW.approved := true;
  ELSIF NEW.status = 'rejected' THEN
    NEW.approved := false;
  ELSE
    NEW.approved := null;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync status
DROP TRIGGER IF EXISTS sync_status_trigger ON phase_unlocks;
CREATE TRIGGER sync_status_trigger
  BEFORE INSERT OR UPDATE OF status ON phase_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION sync_phase_unlock_status();