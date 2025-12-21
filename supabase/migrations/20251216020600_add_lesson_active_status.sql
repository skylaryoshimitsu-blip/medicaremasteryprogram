/*
  # Add Active Status to Lessons

  1. Purpose
    - Add is_active column to lessons table to allow hiding lessons without deletion
    - Mark specific Phase 4 practice exam lessons as inactive
    - Preserve lesson data for audit and historical purposes

  2. Changes
    - Add is_active boolean column to lessons table (default true)
    - Mark "Practice Exam 1 - Comprehensive Test" as inactive
    - Mark "Practice Exam 2 - Final Preparation" as inactive
    - Keep "Medicare Certification Exam Overview" active

  3. Impact
    - Inactive lessons will not appear in student navigation
    - Progress tracking will exclude inactive lessons
    - Historical data is preserved
*/

-- Add is_active column to lessons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE lessons ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Set all existing lessons to active by default
UPDATE lessons SET is_active = true WHERE is_active IS NULL;

-- Mark specific Phase 4 practice exam lessons as inactive
UPDATE lessons
SET is_active = false
WHERE id IN (
  'd4ebd48c-bf5e-4102-a924-77566329434e',  -- Lesson 2: Practice Exam 1 - Comprehensive Test
  '7e7fb952-b17f-45f9-8ca3-5a5e387e78a2'   -- Lesson 3: Practice Exam 2 - Final Preparation
);