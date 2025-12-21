/*
  # Fix Phase Unlock Security

  1. Purpose
    - Prevent students from self-approving phase unlock requests
    - Ensure only admins can change approval status
    - Allow students to upload and update screenshots only

  2. Changes
    - Replace existing "Users can update own phase unlocks" policy
    - Students can update: screenshot_url, uploaded_at
    - Students CANNOT update: approved, reviewed_by, reviewed_at
    - Only admins can approve/reject unlock requests

  3. Security
    - Critical fix: Prevents students from bypassing admin approval
    - Students cannot grant themselves phase access
    - Maintains proper approval workflow
*/

-- Drop the insecure update policy
DROP POLICY IF EXISTS "Users can update own phase unlocks" ON phase_unlocks;

-- Create secure policy for students updating their own phase unlocks
CREATE POLICY "Students can update own phase unlock screenshots"
  ON phase_unlocks
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
    -- Ensure approval fields cannot be changed by students
    AND approved IS NOT DISTINCT FROM (SELECT approved FROM phase_unlocks WHERE id = phase_unlocks.id)
    AND reviewed_by IS NOT DISTINCT FROM (SELECT reviewed_by FROM phase_unlocks WHERE id = phase_unlocks.id)
    AND reviewed_at IS NOT DISTINCT FROM (SELECT reviewed_at FROM phase_unlocks WHERE id = phase_unlocks.id)
  );