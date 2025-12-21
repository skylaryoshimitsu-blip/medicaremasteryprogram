import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Circle, Lock } from 'lucide-react';
import { supabase, Module, Lesson, Quiz, UserProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigate } from '../hooks/useNavigate';
import { Sidebar } from '../components/Sidebar';

type Props = {
  moduleId: string;
};

export function ModuleDetail({ moduleId }: Props) {
  const { user } = useAuth();
  const { isLessonCompleted, isLessonUnlocked, refreshProgress } = useProgress();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModuleData();
    refreshProgress();

    const handleFocus = () => {
      loadModuleData();
      refreshProgress();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [moduleId, user]);

  async function loadModuleData() {
    if (!user) return;

    const [moduleRes, lessonsRes, quizRes, progressRes] = await Promise.all([
      supabase.from('modules').select('*').eq('id', moduleId).single(),
      supabase.from('lessons').select('*').eq('module_id', moduleId).eq('is_active', true).order('order_index'),
      supabase.from('quizzes').select('*').eq('module_id', moduleId).maybeSingle(),
      supabase.from('user_progress').select('*').eq('user_id', user.id).eq('module_id', moduleId).maybeSingle(),
    ]);

    if (moduleRes.data) setModule(moduleRes.data);
    if (lessonsRes.data) setLessons(lessonsRes.data);
    if (quizRes.data) setQuiz(quizRes.data);
    if (progressRes.data) setProgress(progressRes.data);

    setLoading(false);
  }

  const allLessonsCompleted = lessons.every((lesson) => isLessonCompleted(lesson.id));
  const isPhase4 = module?.phase_number === 4;
  const quizUnlocked = allLessonsCompleted && (quiz || isPhase4);
  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  if (!module || !progress?.is_unlocked) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">
            <Lock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">This module is locked</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{module.title}</h1>
            <p className="text-gray-600 mb-4">{module.description}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Module Progress</span>
                <span className="text-sm font-medium text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedCount} of {lessons.length} lessons completed
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const completed = isLessonCompleted(lesson.id);
                const unlocked = isLessonUnlocked(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (unlocked) {
                        navigate({ type: 'lesson', moduleId, lessonId: lesson.id });
                      } else {
                        alert('Complete previous lessons first.');
                      }
                    }}
                    className={`bg-white rounded-lg border border-gray-200 p-4 transition-all ${
                      unlocked
                        ? 'cursor-pointer hover:border-blue-300 hover:shadow-md'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {!unlocked ? (
                        <Lock className="text-gray-400 flex-shrink-0" size={20} />
                      ) : completed ? (
                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      ) : (
                        <Circle className="text-gray-300 flex-shrink-0" size={20} />
                      )}
                      <span className={`font-medium ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                        {lesson.title}
                      </span>
                      {!unlocked && (
                        <span className="ml-auto text-xs text-gray-500">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isPhase4 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Simulation</h2>
              <p className="text-gray-600 mb-4">
                Complete all lessons to unlock the exam simulation. You need 87% to pass. 100 questions | 90 minutes
              </p>
              <button
                onClick={() => allLessonsCompleted && navigate('/exam-simulation')}
                disabled={!allLessonsCompleted}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  allLessonsCompleted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {allLessonsCompleted ? 'Start Exam Simulation' : 'Complete All Lessons First'}
              </button>
            </div>
          ) : quiz && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Module Quiz</h2>
              <p className="text-gray-600 mb-4">
                Complete all lessons to unlock the quiz. You need {quiz.passing_score}% to pass.
              </p>
              <button
                onClick={() => quizUnlocked && navigate({ type: 'quiz', moduleId, quizId: quiz.id })}
                disabled={!quizUnlocked}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  quizUnlocked
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {quizUnlocked ? 'Start Quiz' : 'Complete All Lessons First'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
