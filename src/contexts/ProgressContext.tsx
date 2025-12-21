import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type LessonProgress = {
  completed: boolean;
  unlocked: boolean;
};

type ProgressState = {
  lessons: Record<string, LessonProgress>;
  overallProgress: number;
  totalLessons: number;
  completedLessons: number;
};

type ProgressContextType = {
  progress: ProgressState;
  markLessonComplete: (lessonId: string, moduleId: string) => Promise<void>;
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  refreshProgress: () => Promise<void>;
  loading: boolean;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>({
    lessons: {},
    overallProgress: 0,
    totalLessons: 0,
    completedLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  async function loadProgress() {
    if (!user) return;

    try {
      const [lessonsRes, completionsRes, modulesRes, examAttemptsRes, phaseUnlocksRes] = await Promise.all([
        supabase.from('lessons').select('id, module_id, order_index').eq('is_active', true).order('order_index'),
        supabase.from('lesson_completions').select('lesson_id').eq('user_id', user.id),
        supabase.from('modules').select('id, phase_number').order('phase_number'),
        supabase.from('exam_simulation_attempts').select('*').eq('user_id', user.id).eq('passed', true).limit(1),
        supabase.from('phase_unlocks').select('*').eq('user_id', user.id).eq('phase_number', 5).maybeSingle(),
      ]);

      if (!lessonsRes.data) {
        console.error('Failed to load lessons');
        setLoading(false);
        return;
      }

      const allLessons = lessonsRes.data;
      const completedLessonIds = new Set(completionsRes.data?.map(c => c.lesson_id) || []);
      const modules = modulesRes.data || [];
      const hasPassedExam = (examAttemptsRes.data?.length || 0) > 0;
      const hasUploadedScreenshot = phaseUnlocksRes.data?.screenshot_url != null;
      const phase5Unlocked = hasPassedExam && hasUploadedScreenshot;

      const modulePhaseMap = new Map(modules.map(m => [m.id, m.phase_number]));

      const lessonProgress: Record<string, LessonProgress> = {};
      let lastCompletedIndex = -1;

      allLessons.forEach((lesson, index) => {
        const isCompleted = completedLessonIds.has(lesson.id);
        const lessonPhase = modulePhaseMap.get(lesson.module_id) || 1;

        if (isCompleted) {
          lastCompletedIndex = index;
        }

        const isPhase5Lesson = lessonPhase === 5;
        const baseUnlocked = index === 0 || index <= lastCompletedIndex + 1;

        lessonProgress[lesson.id] = {
          completed: isCompleted,
          unlocked: isPhase5Lesson ? (baseUnlocked && phase5Unlocked) : baseUnlocked,
        };
      });

      const completedCount = completedLessonIds.size;
      const totalCount = allLessons.length;

      setProgress({
        lessons: lessonProgress,
        overallProgress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        totalLessons: totalCount,
        completedLessons: completedCount,
      });

      console.log('Progress loaded:', {
        total: totalCount,
        completed: completedCount,
        percent: Math.round((completedCount / totalCount) * 100),
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  }

  async function markLessonComplete(lessonId: string, moduleId: string) {
    if (!user) {
      console.error('No user found');
      return;
    }

    if (!progress.lessons[lessonId]) {
      console.error('Lesson not found in progress state:', lessonId);
      return;
    }

    if (progress.lessons[lessonId].completed) {
      console.log('Lesson already completed:', lessonId);
      return;
    }

    try {
      console.log('Marking lesson complete:', { lessonId, moduleId, userId: user.id });

      // Step 1: Insert into lesson_completions
      const { error: insertError } = await supabase
        .from('lesson_completions')
        .insert([{
          user_id: user.id,
          lesson_id: lessonId
        }]);

      if (insertError) {
        console.error('Error inserting lesson completion:', insertError);
        throw insertError;
      }

      console.log('✓ Lesson completion recorded in database');

      // Step 2: Check if all lessons in module are complete
      const allComplete = await checkIfModuleLessonsComplete(moduleId);

      if (allComplete) {
        console.log('✓ All lessons in module completed');
      }

      // Step 3: Reload progress to update UI
      await loadProgress();

      console.log('✓ Progress refreshed and UI updated');
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      throw error;
    }
  }

  async function checkIfModuleLessonsComplete(moduleId: string): Promise<boolean> {
    if (!user) return false;

    try {
      // Get all lessons in this module
      const { data: moduleLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', moduleId)
        .eq('is_active', true);

      if (!moduleLessons || moduleLessons.length === 0) return false;

      // Get user's completions for this module
      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', moduleLessons.map(l => l.id));

      const allComplete = moduleLessons.length === (completions?.length || 0);

      console.log('Module completion check:', {
        moduleId,
        totalLessons: moduleLessons.length,
        completedLessons: completions?.length || 0,
        allComplete
      });

      return allComplete;
    } catch (error) {
      console.error('Error checking module lessons:', error);
      return false;
    }
  }

  function isLessonUnlocked(lessonId: string): boolean {
    return progress.lessons[lessonId]?.unlocked ?? false;
  }

  function isLessonCompleted(lessonId: string): boolean {
    return progress.lessons[lessonId]?.completed ?? false;
  }

  async function refreshProgress() {
    await loadProgress();
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markLessonComplete,
        isLessonUnlocked,
        isLessonCompleted,
        refreshProgress,
        loading,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
