/*
  # Phase Locking System Integration

  1. Purpose
    - Implement phase locking logic that requires admin approval for phase access
    - Automatically unlock next phase when admin approves exam proof upload
    - Prevent users from bypassing phase locks

  2. Changes
    - Add trigger function to auto-unlock next phase on approval
    - Add RLS policies to prevent manual phase unlocking by students
    - Ensure Phase 1 is always unlocked for new users

  3. Security
    - Students cannot manually update user_progress to unlock phases
    - Only admins can approve phase_unlocks which triggers auto-unlock
    - Phase 1 remains accessible to all students by default
*/

-- Function to unlock next phase when admin approves upload
CREATE OR REPLACE FUNCTION unlock_next_phase_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  next_phase_number INTEGER;
  next_module_id UUID;
BEGIN
  -- Only proceed if this is an approval (not rejection)
  IF NEW.approved = true AND (OLD.approved IS NULL OR OLD.approved = false) THEN
    -- Calculate next phase number
    next_phase_number := NEW.phase_number + 1;
    
    -- Get the module ID for the next phase
    SELECT id INTO next_module_id
    FROM modules
    WHERE phase_number = next_phase_number
    LIMIT 1;
    
    -- If next phase exists, unlock it
    IF next_module_id IS NOT NULL THEN
      -- Check if user_progress record exists
      IF EXISTS (
        SELECT 1 FROM user_progress 
        WHERE user_id = NEW.user_id 
        AND module_id = next_module_id
      ) THEN
        -- Update existing record
        UPDATE user_progress
        SET 
          is_unlocked = true,
          unlocked_at = now()
        WHERE user_id = NEW.user_id 
        AND module_id = next_module_id;
      ELSE
        -- Create new record
        INSERT INTO user_progress (user_id, module_id, is_unlocked, unlocked_at)
        VALUES (NEW.user_id, next_module_id, true, now());
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on phase_unlocks table
DROP TRIGGER IF EXISTS trigger_unlock_next_phase ON phase_unlocks;
CREATE TRIGGER trigger_unlock_next_phase
  AFTER UPDATE OF approved ON phase_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_phase_on_approval();

-- Add RLS policy to prevent students from manually unlocking phases
DROP POLICY IF EXISTS "Students cannot manually unlock phases" ON user_progress;
CREATE POLICY "Students cannot manually unlock phases"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow admins to update
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Allow students to update only completion status, not unlock status
    (
      user_id = auth.uid() 
      AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
    )
  )
  WITH CHECK (
    -- Allow admins to update anything
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Students can only update is_completed and completed_at, not is_unlocked
    (
      user_id = auth.uid() 
      AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
      AND is_unlocked = (SELECT is_unlocked FROM user_progress WHERE id = user_progress.id)
      AND unlocked_at = (SELECT unlocked_at FROM user_progress WHERE id = user_progress.id)
    )
  );

-- Ensure INSERT policy allows Phase 1 to be auto-created
DROP POLICY IF EXISTS "Users can create their own progress" ON user_progress;
CREATE POLICY "Users can create their own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );