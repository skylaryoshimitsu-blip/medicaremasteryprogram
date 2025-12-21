/*
  # Medicare Mastery Program Database Schema

  ## Overview
  This migration creates the complete database structure for a student learning platform
  with sequential module unlocking, quiz tracking, and admin capabilities.

  ## Tables Created

  ### 1. profiles
  - Extends auth.users with additional profile information
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'student' or 'admin'
  - `created_at` (timestamptz)

  ### 2. modules
  - Represents the six phases of the program
  - `id` (uuid, primary key)
  - `phase_number` (integer) - 1 through 6
  - `title` (text) - e.g., "Phase 1 – Foundations"
  - `description` (text) - Overview text
  - `order_index` (integer) - Sequential ordering
  - `created_at` (timestamptz)

  ### 3. lessons
  - Individual lessons within each module
  - `id` (uuid, primary key)
  - `module_id` (uuid, references modules)
  - `title` (text)
  - `content` (text) - Lesson content
  - `order_index` (integer) - Order within module
  - `created_at` (timestamptz)

  ### 4. quizzes
  - One quiz per module
  - `id` (uuid, primary key)
  - `module_id` (uuid, references modules)
  - `title` (text)
  - `passing_score` (integer) - Default 80%
  - `created_at` (timestamptz)

  ### 5. quiz_questions
  - Multiple choice questions for each quiz
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, references quizzes)
  - `question_text` (text)
  - `options` (jsonb) - Array of answer options
  - `correct_answer` (integer) - Index of correct option
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### 6. user_progress
  - Tracks which modules are unlocked for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `module_id` (uuid, references modules)
  - `is_unlocked` (boolean) - Default false
  - `is_completed` (boolean) - Default false
  - `unlocked_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 7. lesson_completions
  - Tracks completed lessons per user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `lesson_id` (uuid, references lessons)
  - `completed_at` (timestamptz)

  ### 8. quiz_attempts
  - Records all quiz attempts and scores
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `quiz_id` (uuid, references quizzes)
  - `score` (integer) - Percentage score
  - `passed` (boolean)
  - `answers` (jsonb) - User's answers
  - `created_at` (timestamptz)

  ## Security (RLS Policies)

  All tables have Row Level Security enabled with the following policies:

  ### profiles
  - Users can view their own profile
  - Admins can view all profiles
  - Users can update their own profile

  ### modules, lessons, quizzes, quiz_questions
  - All authenticated users can read
  - Only admins can insert/update/delete

  ### user_progress, lesson_completions, quiz_attempts
  - Users can read their own records
  - Admins can read all records
  - Users can insert/update their own records
  - Admins can insert/update/delete all records

  ## Important Notes
  - Phase 1 is automatically unlocked for new users via trigger
  - Module unlocking happens automatically when quiz is passed
  - Minimum passing score is 80%
  - All timestamps use UTC timezone
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number integer UNIQUE NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid UNIQUE NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  passing_score integer NOT NULL DEFAULT 80 CHECK (passing_score BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_unlocked boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  unlocked_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, module_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create lesson_completions table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed boolean NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for modules
CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for lessons
CREATE POLICY "Authenticated users can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for quizzes
CREATE POLICY "Authenticated users can view quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for quiz_questions
CREATE POLICY "Authenticated users can view quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for lesson_completions
CREATE POLICY "Users can view own completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert own completions"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete completions"
  ON lesson_completions FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete attempts"
  ON quiz_attempts FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to initialize user progress for Phase 1
CREATE OR REPLACE FUNCTION initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, module_id, is_unlocked, unlocked_at)
  SELECT NEW.id, id, true, now()
  FROM modules
  WHERE phase_number = 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-unlock Phase 1 for new users
DROP TRIGGER IF EXISTS on_user_created ON profiles;
CREATE TRIGGER on_user_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_progress();

-- Function to unlock next module after quiz pass
CREATE OR REPLACE FUNCTION unlock_next_module()
RETURNS TRIGGER AS $$
DECLARE
  current_phase integer;
  next_module_id uuid;
BEGIN
  IF NEW.passed = true THEN
    -- Get current module phase
    SELECT m.phase_number INTO current_phase
    FROM quizzes q
    JOIN modules m ON q.module_id = m.id
    WHERE q.id = NEW.quiz_id;
    
    -- Mark current module as completed
    UPDATE user_progress
    SET is_completed = true, completed_at = now()
    WHERE user_id = NEW.user_id 
      AND module_id = (SELECT module_id FROM quizzes WHERE id = NEW.quiz_id);
    
    -- Get next module
    SELECT id INTO next_module_id
    FROM modules
    WHERE phase_number = current_phase + 1;
    
    -- Unlock next module if exists
    IF next_module_id IS NOT NULL THEN
      INSERT INTO user_progress (user_id, module_id, is_unlocked, unlocked_at)
      VALUES (NEW.user_id, next_module_id, true, now())
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET is_unlocked = true, unlocked_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-unlock next module
DROP TRIGGER IF EXISTS on_quiz_passed ON quiz_attempts;
CREATE TRIGGER on_quiz_passed
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_module();