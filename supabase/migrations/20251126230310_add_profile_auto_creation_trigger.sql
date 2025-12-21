/*
  # Add Profile Auto-Creation Trigger

  This migration creates a trigger to automatically create a profile record
  when a new user signs up.

  ## Changes
  
  1. **Function: handle_new_user**
     - Automatically creates a profile record in the profiles table
     - Copies email from auth.users
     - Sets default role to 'student'
     - Creates initial user_progress records for all modules with first module unlocked
  
  2. **Trigger: on_auth_user_created**
     - Fires after INSERT on auth.users
     - Calls handle_new_user function
  
  ## Security
  - Function runs with SECURITY DEFINER to bypass RLS
  - Only creates records for the new user
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_module_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    'student'
  );

  -- Get first module ID (lowest order_index)
  SELECT id INTO first_module_id
  FROM public.modules
  ORDER BY order_index
  LIMIT 1;

  -- Create user_progress records for all modules
  INSERT INTO public.user_progress (user_id, module_id, is_unlocked, is_completed, unlocked_at)
  SELECT 
    NEW.id,
    m.id,
    CASE WHEN m.id = first_module_id THEN true ELSE false END,
    false,
    CASE WHEN m.id = first_module_id THEN NOW() ELSE NULL END
  FROM public.modules m;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
