/*
  # Create Exam System Tables

  1. New Tables
    - `exam_versions` - Stores exam version metadata (A-E)
      - `id` (uuid, primary key)
      - `version_letter` (text, A-E)
      - `version_number` (integer, 1-5)
      - `title` (text)
      - `passing_score` (integer, default 87)
      - `total_questions` (integer, default 100)
      - `created_at` (timestamp)
    
    - `exam_questions` - Stores all 500 questions
      - `id` (uuid, primary key)
      - `version_id` (uuid, FK to exam_versions)
      - `question_number` (integer, 1-100)
      - `question_text` (text)
      - `option_a` (text)
      - `option_b` (text)
      - `option_c` (text)
      - `option_d` (text)
      - `correct_answer` (text, A-D)
      - `created_at` (timestamp)
    
    - `exam_attempts` - Replaces exam_simulation_attempts
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to profiles)
      - `version_id` (uuid, FK to exam_versions)
      - `score` (integer, 0-100)
      - `passed` (boolean)
      - `answers` (jsonb)
      - `time_remaining` (integer, seconds)
      - `created_at` (timestamp)
    
    - `exam_answer_keys` - Stores answer key JSON for each version
      - `id` (uuid, primary key)
      - `version_id` (uuid, FK to exam_versions)
      - `answer_key` (jsonb, array of correct answers)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create exam_versions table
CREATE TABLE IF NOT EXISTS exam_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_letter text NOT NULL CHECK (version_letter IN ('A', 'B', 'C', 'D', 'E')),
  version_number integer NOT NULL CHECK (version_number >= 1 AND version_number <= 5),
  title text NOT NULL,
  passing_score integer DEFAULT 87 CHECK (passing_score >= 0 AND passing_score <= 100),
  total_questions integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  UNIQUE(version_letter),
  UNIQUE(version_number)
);

ALTER TABLE exam_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all exam versions"
  ON exam_versions FOR SELECT
  TO authenticated
  USING (true);

-- Create exam_questions table
CREATE TABLE IF NOT EXISTS exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES exam_versions(id) ON DELETE CASCADE,
  question_number integer NOT NULL CHECK (question_number >= 1 AND question_number <= 100),
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(version_id, question_number)
);

ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all exam questions"
  ON exam_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create exam_attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES exam_versions(id) ON DELETE CASCADE,
  score integer CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL,
  answers jsonb,
  time_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam attempts"
  ON exam_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create exam_answer_keys table
CREATE TABLE IF NOT EXISTS exam_answer_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES exam_versions(id) ON DELETE CASCADE,
  answer_key jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(version_id)
);

ALTER TABLE exam_answer_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all answer keys"
  ON exam_answer_keys FOR SELECT
  TO authenticated
  USING (true);
