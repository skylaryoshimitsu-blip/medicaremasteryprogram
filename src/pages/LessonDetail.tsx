import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { supabase, Lesson } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigate } from '../hooks/useNavigate';
import { Sidebar } from '../components/Sidebar';

type Props = {
  moduleId: string;
  lessonId: string;
};

export function LessonDetail({ moduleId, lessonId }: Props) {
  const { user } = useAuth();
  const { markLessonComplete, isLessonUnlocked, isLessonCompleted, progress } = useProgress();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [previousLesson, setPreviousLesson] = useState<Lesson | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isCompleted = isLessonCompleted(lessonId);
  const isUnlocked = isLessonUnlocked(lessonId);

  useEffect(() => {
    loadLessonData();
  }, [lessonId, user]);

  async function loadLessonData() {
    if (!user) return;

    const [lessonRes, lessonsRes, quizRes] = await Promise.all([
      supabase.from('lessons').select('*').eq('id', lessonId).eq('is_active', true).maybeSingle(),
      supabase.from('lessons').select('*').eq('module_id', moduleId).eq('is_active', true).order('order_index', { ascending: true }),
      supabase.from('quizzes').select('id').eq('module_id', moduleId).maybeSingle(),
    ]);

    if (lessonRes.data) {
      setLesson(lessonRes.data);

      if (lessonsRes.data) {
        setAllLessons(lessonsRes.data);
        const currentIndex = lessonsRes.data.findIndex(l => l.id === lessonId);

        if (currentIndex !== -1) {
          if (currentIndex < lessonsRes.data.length - 1) {
            setNextLesson(lessonsRes.data[currentIndex + 1]);
          } else {
            setNextLesson(null);
          }

          if (currentIndex > 0) {
            setPreviousLesson(lessonsRes.data[currentIndex - 1]);
          } else {
            setPreviousLesson(null);
          }
        }
      }
    }

    if (quizRes.data) {
      setHasQuiz(true);
      setQuizId(quizRes.data.id);
    }

    setLoading(false);
  }


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

  if (!lesson) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">Lesson not found</div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate({ type: 'module', id: moduleId })}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Module
            </button>
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Lock className="mx-auto mb-4 text-gray-400" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
              <p className="text-gray-600 mb-6">Complete previous lessons first to unlock this lesson.</p>
              <button
                onClick={() => navigate({ type: 'module', id: moduleId })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Module
              </button>
            </div>
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
            onClick={() => navigate({ type: 'module', id: moduleId })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Module
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              {isCompleted && (
                <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle size={20} />
                  Completed
                </span>
              )}
            </div>

            {/* LESSON CONTENT START */}
            <div className="prose max-w-none">
              {lesson.content ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-800 font-medium mb-2">Content Placeholder</p>
                  <p className="text-yellow-700 text-sm">
                    This lesson will be populated with content converted from PDF.
                  </p>
                  <p className="text-yellow-600 text-xs mt-2">
                    Supports: Headings, Paragraphs, Lists, Images, Code blocks, Long-form text
                  </p>
                </div>
              )}
            </div>
            {/* LESSON CONTENT END */}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              {previousLesson ? (
                <button
                  onClick={() => navigate({ type: 'lesson', moduleId, lessonId: previousLesson.id })}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Previous Lesson
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => navigate({ type: 'lessonQuiz', lessonId })}
                className="flex-1 max-w-md px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Take Knowledge Check Quiz →
              </button>

              {nextLesson ? (
                <button
                  onClick={() => navigate({ type: 'lesson', moduleId, lessonId: nextLesson.id })}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next Lesson
                  <ChevronRight size={20} />
                </button>
              ) : hasQuiz && quizId ? (
                <button
                  onClick={() => navigate({ type: 'quiz', moduleId, quizId })}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Module Quiz
                  <ChevronRight size={20} />
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
