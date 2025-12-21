/*
  # Fix RLS Policies for Module Visibility

  This migration fixes RLS policies to ensure authenticated users can access all learning content.

  ## Changes
  
  1. **Modules Table**
     - Drop existing policies
     - Create new policy: Allow all authenticated users to SELECT modules
  
  2. **Lessons Table**
     - Drop existing policies
     - Create new policy: Allow all authenticated users to SELECT lessons
  
  3. **Quizzes Table**
     - Create policy: Allow all authenticated users to SELECT quizzes
  
  4. **Quiz Questions Table**
     - Create policy: Allow all authenticated users to SELECT quiz_questions
  
  5. **User Progress Table**
     - Update policies to ensure users can only access their own progress
     - SELECT: user_id = auth.uid()
     - INSERT: user_id = auth.uid()
     - UPDATE: user_id = auth.uid()
  
  ## Security
  - All tables maintain RLS enabled
  - Users can only read learning content, not modify it
  - User progress is isolated per user
*/

-- Drop and recreate modules policies
DROP POLICY IF EXISTS "Authenticated users can view modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;

CREATE POLICY "Allow read modules"
  ON modules
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Drop and recreate lessons policies
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

CREATE POLICY "Allow read lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Drop and recreate quizzes policies
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;

CREATE POLICY "Allow read quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Drop and recreate quiz_questions policies
DROP POLICY IF EXISTS "Authenticated users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;

CREATE POLICY "Allow read quiz_questions"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix user_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Admins can delete progress" ON user_progress;

CREATE POLICY "Allow select own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
