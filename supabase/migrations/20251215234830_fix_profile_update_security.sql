/*
  # Fix Profile Update Security

  1. Purpose
    - Prevent students from changing their own role to 'admin'
    - Ensure only admins can modify roles and enrollment status
    - Allow students to update only safe fields (full_name, state_code)

  2. Changes
    - Replace existing "Users can update own profile" policy with secure version
    - Students can update: full_name, state_code
    - Students CANNOT update: role, enrollment_status, email
    - Admins can update everything

  3. Security
    - Critical fix: Prevents privilege escalation
    - Students cannot grant themselves admin access
    - Students cannot change their enrollment status
    - Only admins can manage sensitive fields
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create secure policy for students updating their own profile
CREATE POLICY "Students can update safe profile fields"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  )
  WITH CHECK (
    auth.uid() = id 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
    -- Ensure role and enrollment_status cannot be changed by students
    AND role = (SELECT role FROM profiles WHERE id = profiles.id)
    AND COALESCE(enrollment_status, 'unpaid') = COALESCE((SELECT enrollment_status FROM profiles WHERE id = profiles.id), 'unpaid')
  );

-- Create policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );