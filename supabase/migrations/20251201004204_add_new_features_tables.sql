/*
  # Add New Feature Tables for Medicare Mastery Platform

  1. New Tables
    - `lesson_quizzes` - 5-question knowledge checks per lesson
    - `lesson_quiz_questions` - Questions for lesson quizzes
    - `lesson_quiz_attempts` - Student attempts on lesson quizzes
    - `state_syllabus` - State licensing requirements (50 states + DC)
    - `flashcards` - Digital flashcard system
    - `teacher_answer_keys` - Admin-only answer repository
    - `exam_simulations` - 5 versions of 100-question exams
    - `exam_simulation_attempts` - Track exam simulation attempts
    - `phase_unlocks` - Track phase unlock requirements (screenshots, etc.)
    - `course_materials` - Store PDFs and documents
    
  2. New Columns
    - `profiles.state_code` - User's testing state
    - `quiz_attempts.question_order` - Store randomized order
    - `modules.course_outline_url` - PDF outline link
    
  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Add state_code to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'state_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state_code text;
  END IF;
END $$;

-- Add question_order to quiz_attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_attempts' AND column_name = 'question_order'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN question_order jsonb;
  END IF;
END $$;

-- Lesson Quizzes (5 questions each)
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE UNIQUE NOT NULL,
  title text NOT NULL,
  passing_score integer DEFAULT 80 CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lesson quizzes"
  ON lesson_quizzes FOR SELECT
  TO authenticated
  USING (true);

-- Lesson Quiz Questions
CREATE TABLE IF NOT EXISTS lesson_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_quiz_id uuid REFERENCES lesson_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text DEFAULT '',
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer integer DEFAULT 0,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lesson quiz questions"
  ON lesson_quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lesson quiz questions"
  ON lesson_quiz_questions FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Lesson Quiz Attempts
CREATE TABLE IF NOT EXISTS lesson_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_quiz_id uuid REFERENCES lesson_quizzes(id) ON DELETE CASCADE NOT NULL,
  score integer CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL,
  answers jsonb,
  question_order jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson quiz attempts"
  ON lesson_quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own lesson quiz attempts"
  ON lesson_quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- State Syllabus
CREATE TABLE IF NOT EXISTS state_syllabus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  topic text NOT NULL,
  weight numeric,
  description text DEFAULT '',
  module_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE state_syllabus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view state syllabus"
  ON state_syllabus FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage state syllabus"
  ON state_syllabus FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage flashcards"
  ON flashcards FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Teacher Answer Keys
CREATE TABLE IF NOT EXISTS teacher_answer_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  correct_answer integer NOT NULL,
  explanation text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, question_id)
);

ALTER TABLE teacher_answer_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view teacher answer keys"
  ON teacher_answer_keys FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can manage teacher answer keys"
  ON teacher_answer_keys FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Exam Simulations
CREATE TABLE IF NOT EXISTS exam_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number integer NOT NULL CHECK (version_number >= 1 AND version_number <= 5),
  question_text text DEFAULT '',
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer integer DEFAULT 0,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exam simulations"
  ON exam_simulations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage exam simulations"
  ON exam_simulations FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Exam Simulation Attempts
CREATE TABLE IF NOT EXISTS exam_simulation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL CHECK (version_number >= 1 AND version_number <= 5),
  score integer CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL,
  answers jsonb,
  question_order jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_simulation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam attempts"
  ON exam_simulation_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own exam attempts"
  ON exam_simulation_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Phase Unlocks (for screenshot upload, etc.)
CREATE TABLE IF NOT EXISTS phase_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  phase_number integer NOT NULL,
  screenshot_url text,
  uploaded_at timestamptz,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, phase_number)
);

ALTER TABLE phase_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phase unlocks"
  ON phase_unlocks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own phase unlocks"
  ON phase_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own phase unlocks"
  ON phase_unlocks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Course Materials (PDFs, etc.)
CREATE TABLE IF NOT EXISTS course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  material_type text NOT NULL,
  phase_number integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course materials"
  ON course_materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage course materials"
  ON course_materials FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');