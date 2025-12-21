/*
  # Admin Role Helper Functions

  1. Helper Functions
    - `is_admin()` - Check if current user is an admin
    - `get_user_role(user_id)` - Get role for a specific user
  
  2. Security
    - Functions are marked as SECURITY DEFINER where needed
    - Proper RLS policies ensure only admins can modify roles
*/

-- Function to check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND role = 'admin'
  );
$$;

-- Function to get the role of a specific user (or current user if no ID provided)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM public.profiles 
  WHERE id = COALESCE(user_id, auth.uid())
  LIMIT 1;
$$;

-- Function to safely set a user's role (admin only)
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can change roles
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;

  -- Validate role value
  IF new_role NOT IN ('student', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be student or admin';
  END IF;

  -- Update the role
  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$;

-- Update RLS policy on profiles to allow admins to update other users' roles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile or admins can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own profile (except role)
    -- Admins can update any profile
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    -- Users can only update their own non-role fields
    -- Admins can update anything
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;