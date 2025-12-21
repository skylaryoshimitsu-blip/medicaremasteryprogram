/*
  # Fix Exam Answer Key Security

  1. Purpose
    - Prevent students from viewing exam answer keys
    - Ensure only admins can access answer keys
    - Maintain exam integrity

  2. Changes
    - Replace "Users can view all answer keys" policy
    - Only admins can view answer keys
    - Students cannot access answer keys

  3. Security
    - Critical fix: Prevents students from cheating
    - Answer keys are admin-only
    - Maintains exam security and integrity
*/

-- Drop the insecure policy that allows all users to view answer keys
DROP POLICY IF EXISTS "Users can view all answer keys" ON exam_answer_keys;

-- Create secure policy: only admins can view answer keys
CREATE POLICY "Only admins can view answer keys"
  ON exam_answer_keys
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );