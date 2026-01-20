/*
  # Admin Account Auto-Unlock System

  1. Purpose
    - Automatically unlock all phases for admin account (support@medicaremastery.com)
    - Ensure admin account always has full access to all content
    - Create trigger to maintain unlock state for admin accounts

  2. Changes
    - Create function to auto-unlock all phases for admin users
    - Create trigger that runs when profiles are inserted or updated
    - Immediately unlock all phases for existing admin accounts

  3. Security
    - Only affects users with role='admin' or email='support@medicaremastery.com'
    - Does not affect student accounts
    - Maintains admin override for all content
*/

-- Function to auto-unlock all phases for admin users
CREATE OR REPLACE FUNCTION auto_unlock_admin_phases()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is admin
  IF NEW.role = 'admin' OR NEW.email = 'support@medicaremastery.com' THEN
    -- Unlock all phases for this admin
    INSERT INTO user_progress (user_id, module_id, is_unlocked, unlocked_at)
    SELECT NEW.id, id, true, now()
    FROM modules
    ON CONFLICT (user_id, module_id) 
    DO UPDATE SET 
      is_unlocked = true,
      unlocked_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_auto_unlock_admin ON profiles;
CREATE TRIGGER trigger_auto_unlock_admin
  AFTER INSERT OR UPDATE OF role, email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_unlock_admin_phases();

-- Immediately unlock all phases for existing admin accounts
INSERT INTO user_progress (user_id, module_id, is_unlocked, unlocked_at)
SELECT p.id, m.id, true, now()
FROM profiles p
CROSS JOIN modules m
WHERE p.role = 'admin' OR p.email = 'support@medicaremastery.com'
ON CONFLICT (user_id, module_id) 
DO UPDATE SET 
  is_unlocked = true,
  unlocked_at = now();
