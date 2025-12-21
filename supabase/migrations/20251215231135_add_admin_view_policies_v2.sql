/*
  # Add Admin View Policies

  1. Changes
    - Add policies for admins to view all student data
    - Allow admins to read phase_unlocks
    - Allow admins to read exam_simulation_attempts
    - Allow admins to update enrollment_status

  2. Security
    - Only users with role = 'admin' can access this data
*/

-- Allow admins to view all phase unlocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all phase unlocks'
  ) THEN
    CREATE POLICY "Admins can view all phase unlocks"
      ON phase_unlocks FOR SELECT
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Allow admins to update phase unlocks (for approval)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update phase unlocks'
  ) THEN
    CREATE POLICY "Admins can update phase unlocks"
      ON phase_unlocks FOR UPDATE
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Allow admins to view all exam simulation attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all exam attempts'
  ) THEN
    CREATE POLICY "Admins can view all exam attempts"
      ON exam_simulation_attempts FOR SELECT
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Allow admins to view all quiz attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all quiz attempts'
  ) THEN
    CREATE POLICY "Admins can view all quiz attempts"
      ON quiz_attempts FOR SELECT
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Allow admins to view all user progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all user progress'
  ) THEN
    CREATE POLICY "Admins can view all user progress"
      ON user_progress FOR SELECT
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Allow admins to view all lesson completions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all lesson completions'
  ) THEN
    CREATE POLICY "Admins can view all lesson completions"
      ON lesson_completions FOR SELECT
      TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;