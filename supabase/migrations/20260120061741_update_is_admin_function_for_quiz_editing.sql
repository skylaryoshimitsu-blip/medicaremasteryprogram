/*
  # Update is_admin function to include support email

  1. Purpose
    - Allow the support@medicaremastery.com account to edit quizzes
    - Update the is_admin() function to check for both admin role and support email

  2. Changes
    - Modify is_admin() function to return true for support@medicaremastery.com
    - This enables quiz editing permissions for the admin account

  3. Security
    - Maintains existing admin role check
    - Adds specific email check for quiz admin permissions
*/

-- Update is_admin function to check for support email OR admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 
  FROM public.profiles 
  WHERE id = auth.uid() 
  AND (role = 'admin' OR email = 'support@medicaremastery.com')
);
$$;
