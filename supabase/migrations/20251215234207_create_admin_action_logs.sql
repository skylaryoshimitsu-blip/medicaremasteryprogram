/*
  # Admin Action Logging System

  1. Purpose
    - Track all admin actions for accountability and safety
    - Log approvals, rejections, and content modifications
    - Maintain audit trail of administrative activities

  2. New Tables
    - `admin_action_logs`
      - `id` (uuid, primary key)
      - `admin_user_id` (uuid, references auth.users)
      - `action_type` (text) - type of action performed
      - `target_type` (text) - type of entity affected (student, upload, lesson, quiz)
      - `target_id` (uuid) - ID of affected entity
      - `details` (jsonb) - additional action details
      - `created_at` (timestamptz) - when action occurred

  3. Security
    - Enable RLS on admin_action_logs
    - Only admins can insert logs
    - Only admins can view logs
    - Logs are immutable once created (no updates/deletes)

  4. Action Types
    - 'upload_approved' - Approved student exam proof upload
    - 'upload_rejected' - Rejected student exam proof upload
    - 'lesson_created' - Created new lesson content
    - 'lesson_updated' - Modified lesson content
    - 'lesson_deleted' - Deleted lesson content
    - 'quiz_created' - Created new quiz
    - 'quiz_updated' - Modified quiz questions/content
    - 'quiz_deleted' - Deleted quiz
    - 'student_unlocked' - Manually unlocked student access
*/

-- Create admin action logs table
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_user 
  ON admin_action_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at 
  ON admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type 
  ON admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target 
  ON admin_action_logs(target_type, target_id);

-- Enable RLS
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can insert logs
CREATE POLICY "Admins can insert action logs"
  ON admin_action_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Only admins can view logs
CREATE POLICY "Admins can view all action logs"
  ON admin_action_logs
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- No update or delete policies - logs are immutable