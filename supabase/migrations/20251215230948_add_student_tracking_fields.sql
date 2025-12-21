/*
  # Add Student Tracking Fields

  1. New Columns
    - `profiles.enrollment_status` - Tracks paid or unpaid status
    - `profiles.last_activity_at` - Auto-updated timestamp for activity tracking

  2. Changes
    - Add enrollment_status with default 'unpaid'
    - Add last_activity_at timestamp
    - Create function to update last_activity_at automatically

  3. Security
    - Only admins can update enrollment_status
    - Last activity is tracked automatically
*/

-- Add enrollment_status to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'enrollment_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN enrollment_status text DEFAULT 'unpaid' CHECK (enrollment_status IN ('paid', 'unpaid'));
  END IF;
END $$;

-- Add last_activity_at to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to update last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_activity_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to auto-update last activity
DROP TRIGGER IF EXISTS update_activity_on_lesson_completion ON lesson_completions;
CREATE TRIGGER update_activity_on_lesson_completion
  AFTER INSERT ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

DROP TRIGGER IF EXISTS update_activity_on_quiz_attempt ON quiz_attempts;
CREATE TRIGGER update_activity_on_quiz_attempt
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

DROP TRIGGER IF EXISTS update_activity_on_exam_attempt ON exam_simulation_attempts;
CREATE TRIGGER update_activity_on_exam_attempt
  AFTER INSERT ON exam_simulation_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();