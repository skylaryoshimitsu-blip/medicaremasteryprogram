/*
  # Admin RLS Policies

  1. Policy Updates
    - Add admin SELECT policy for profiles (view all users)
    - Add admin DELETE policies for user_progress, lesson_completions, quiz_attempts
    - Add admin INSERT/UPDATE/DELETE policies for content management (modules, lessons, quizzes, quiz_questions)
  
  2. Security
    - All admin policies check is_admin() function
    - Ensures only authenticated admins can perform privileged operations
    - Server-side validation prevents unauthorized access even if UI is bypassed
*/

-- PROFILES: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- USER_PROGRESS: Allow admins to manage all user progress
CREATE POLICY "Admins can view all user progress"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete any user progress"
  ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert any user progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- LESSON_COMPLETIONS: Allow admins to manage all completions
CREATE POLICY "Admins can view all lesson completions"
  ON public.lesson_completions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete any lesson completion"
  ON public.lesson_completions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- QUIZ_ATTEMPTS: Allow admins to manage all attempts
CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete any quiz attempt"
  ON public.quiz_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- MODULES: Allow admins to manage content
CREATE POLICY "Admins can insert modules"
  ON public.modules
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update modules"
  ON public.modules
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete modules"
  ON public.modules
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- LESSONS: Allow admins to manage content
CREATE POLICY "Admins can insert lessons"
  ON public.lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update lessons"
  ON public.lessons
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete lessons"
  ON public.lessons
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- QUIZZES: Allow admins to manage content
CREATE POLICY "Admins can insert quizzes"
  ON public.quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update quizzes"
  ON public.quizzes
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete quizzes"
  ON public.quizzes
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- QUIZ_QUESTIONS: Allow admins to manage content
CREATE POLICY "Admins can insert quiz questions"
  ON public.quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update quiz questions"
  ON public.quiz_questions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete quiz questions"
  ON public.quiz_questions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());