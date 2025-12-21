/*
  # Create Exam Proof Storage Bucket

  1. Purpose
    - Create storage bucket for exam proof uploads (images and PDFs)
    - Set up RLS policies for secure file access
    - Allow students to upload their own files
    - Allow admins to view all files

  2. Changes
    - Create 'exam-proofs' storage bucket
    - Enable RLS on bucket
    - Add upload policy for students
    - Add view policy for admins and file owners

  3. Security
    - Students can only upload files to their own user folder
    - Students can only view their own uploaded files
    - Admins can view all uploaded files
    - File size limit: 10MB
*/

-- Create the exam-proofs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exam-proofs',
  'exam-proofs',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can upload own exam proofs" ON storage.objects;
DROP POLICY IF EXISTS "Students can view own exam proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all exam proofs" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete own exam proofs" ON storage.objects;

-- Allow students to upload their own exam proofs
CREATE POLICY "Students can upload own exam proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exam-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow students to view their own uploaded files
CREATE POLICY "Students can view own exam proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exam-proofs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Allow users to delete their own files (for re-upload)
CREATE POLICY "Students can delete own exam proofs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exam-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );