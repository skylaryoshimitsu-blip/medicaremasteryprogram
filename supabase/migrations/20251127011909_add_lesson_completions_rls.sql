/*
  # Add RLS Policies for Lesson Completions

  This migration adds RLS policies to lesson_completions table.

  ## Changes
  
  1. **Lesson Completions Table**
     - Enable RLS
     - Allow users to SELECT their own completions
     - Allow users to INSERT their own completions
     - Allow users to DELETE their own completions (for reset)
  
  ## Security
  - Users can only access their own lesson completions
*/

-- Enable RLS on lesson_completions
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select own lesson completions" ON lesson_completions;
DROP POLICY IF EXISTS "Allow insert own lesson completions" ON lesson_completions;
DROP POLICY IF EXISTS "Allow delete own lesson completions" ON lesson_completions;

-- Create policies
CREATE POLICY "Allow select own lesson completions"
  ON lesson_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert own lesson completions"
  ON lesson_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow delete own lesson completions"
  ON lesson_completions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
