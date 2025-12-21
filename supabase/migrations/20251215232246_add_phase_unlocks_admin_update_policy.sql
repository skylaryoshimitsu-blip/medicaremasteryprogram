/*
  # Add Admin Update Policy for Phase Unlocks

  1. Changes
    - Add policy allowing admins to update phase_unlocks for review actions
    
  2. Security
    - Only admins can update approved, reviewed_by, and reviewed_at fields
*/

-- Add policy for admins to update phase unlocks
CREATE POLICY "Admins can update phase unlock reviews"
  ON phase_unlocks FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');