import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  state_code?: string | null;
  enrollment_status?: 'paid' | 'unpaid';
  last_activity_at?: string | null;
  created_at: string;
};

export type Module = {
  id: string;
  phase_number: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
};

export type Quiz = {
  id: string;
  module_id: string;
  title: string;
  passing_score: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  order_index: number;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  module_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  unlocked_at: string | null;
  completed_at: string | null;
};

export type LessonCompletion = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
};

export type QuizAttempt = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  created_at: string;
};

// Admin role helper functions
export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
  return data as boolean;
}

export async function getUserRole(userId?: string): Promise<'student' | 'admin' | null> {
  const { data, error } = await supabase.rpc('get_user_role', {
    user_id: userId || null
  });
  if (error) {
    console.error('Error getting user role:', error);
    return null;
  }
  return data as 'student' | 'admin';
}

export async function setUserRole(
  targetUserId: string,
  newRole: 'student' | 'admin'
): Promise<boolean> {
  const { data, error } = await supabase.rpc('set_user_role', {
    target_user_id: targetUserId,
    new_role: newRole
  });

  if (error) {
    console.error('Error setting user role:', error);
    throw error;
  }

  return data as boolean;
}
