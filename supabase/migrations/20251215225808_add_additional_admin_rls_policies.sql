/*
  # Additional Admin RLS Policies

  1. Policy Updates
    - Add admin policies for exam system tables
    - Add admin policies for flashcards
    - Add admin policies for lesson quizzes
    - Add admin policies for phase unlocks
    - Add admin policies for state syllabus
    - Add admin policies for teacher answer keys
    - Add admin policies for course materials
  
  2. Security
    - All policies use is_admin() for server-side validation
    - Ensures admins can fully manage all content and user data
*/

-- EXAM_VERSIONS: Admin content management
CREATE POLICY "Admins can view exam versions"
  ON public.exam_versions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert exam versions"
  ON public.exam_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exam versions"
  ON public.exam_versions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete exam versions"
  ON public.exam_versions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EXAM_QUESTIONS: Admin content management
CREATE POLICY "Admins can view exam questions"
  ON public.exam_questions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert exam questions"
  ON public.exam_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exam questions"
  ON public.exam_questions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete exam questions"
  ON public.exam_questions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EXAM_ANSWER_KEYS: Admin management
CREATE POLICY "Admins can view exam answer keys"
  ON public.exam_answer_keys
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert exam answer keys"
  ON public.exam_answer_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exam answer keys"
  ON public.exam_answer_keys
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete exam answer keys"
  ON public.exam_answer_keys
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EXAM_ATTEMPTS: Admin can view/delete
CREATE POLICY "Admins can view all exam attempts"
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete exam attempts"
  ON public.exam_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EXAM_SIMULATION_ATTEMPTS: Admin can view/delete
CREATE POLICY "Admins can view all exam simulation attempts"
  ON public.exam_simulation_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete exam simulation attempts"
  ON public.exam_simulation_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EXAM_SIMULATIONS: Admin content management
CREATE POLICY "Admins can view exam simulations"
  ON public.exam_simulations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert exam simulations"
  ON public.exam_simulations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exam simulations"
  ON public.exam_simulations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete exam simulations"
  ON public.exam_simulations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- FLASHCARDS: Admin content management
CREATE POLICY "Admins can view flashcards"
  ON public.flashcards
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert flashcards"
  ON public.flashcards
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update flashcards"
  ON public.flashcards
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete flashcards"
  ON public.flashcards
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- LESSON_QUIZZES: Admin content management
CREATE POLICY "Admins can view lesson quizzes"
  ON public.lesson_quizzes
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert lesson quizzes"
  ON public.lesson_quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update lesson quizzes"
  ON public.lesson_quizzes
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete lesson quizzes"
  ON public.lesson_quizzes
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- LESSON_QUIZ_QUESTIONS: Admin content management
CREATE POLICY "Admins can view lesson quiz questions"
  ON public.lesson_quiz_questions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert lesson quiz questions"
  ON public.lesson_quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update lesson quiz questions"
  ON public.lesson_quiz_questions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete lesson quiz questions"
  ON public.lesson_quiz_questions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- LESSON_QUIZ_ATTEMPTS: Admin can view/delete
CREATE POLICY "Admins can view all lesson quiz attempts"
  ON public.lesson_quiz_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete lesson quiz attempts"
  ON public.lesson_quiz_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- PHASE_UNLOCKS: Admin can view/update/delete
CREATE POLICY "Admins can view all phase unlocks"
  ON public.phase_unlocks
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update phase unlocks"
  ON public.phase_unlocks
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete phase unlocks"
  ON public.phase_unlocks
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- STATE_SYLLABUS: Admin content management
CREATE POLICY "Admins can view state syllabus"
  ON public.state_syllabus
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert state syllabus"
  ON public.state_syllabus
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update state syllabus"
  ON public.state_syllabus
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete state syllabus"
  ON public.state_syllabus
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- TEACHER_ANSWER_KEYS: Admin management
CREATE POLICY "Admins can view teacher answer keys"
  ON public.teacher_answer_keys
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert teacher answer keys"
  ON public.teacher_answer_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update teacher answer keys"
  ON public.teacher_answer_keys
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete teacher answer keys"
  ON public.teacher_answer_keys
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- COURSE_MATERIALS: Admin content management
CREATE POLICY "Admins can view course materials"
  ON public.course_materials
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert course materials"
  ON public.course_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update course materials"
  ON public.course_materials
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete course materials"
  ON public.course_materials
  FOR DELETE
  TO authenticated
  USING (public.is_admin());