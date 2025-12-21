import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentRoute, useNavigate } from '../hooks/useNavigate';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export default function LessonQuiz() {
  const route = useCurrentRoute();
  const lessonId = typeof route === 'object' && route.type === 'lessonQuiz' ? route.lessonId : null;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [lesson, setLesson] = useState<any>(null);
  const [moduleId, setModuleId] = useState<string>('');

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  async function loadQuiz() {
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*, modules(id)')
      .eq('id', lessonId)
      .eq('is_active', true)
      .maybeSingle();

    if (lessonData) {
      setLesson(lessonData);
      setModuleId((lessonData as any).modules?.id || '');
    }

    const { data: quizData } = await supabase
      .from('lesson_quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (quizData) {
      setQuiz(quizData);
      const { data: questionsData } = await supabase
        .from('lesson_quiz_questions')
        .select('*')
        .eq('lesson_quiz_id', quizData.id)
        .order('order_index');

      if (questionsData) {
        const shuffled = [...questionsData].sort(() => Math.random() - 0.5).map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
        }));
        setQuestions(shuffled);
      }
    }
  }

  async function handleSubmit() {
    const unansweredQuestions = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => answers[q.id] === undefined);

    if (unansweredQuestions.length > 0) {
      const questionNumbers = unansweredQuestions.map(({ idx }) => idx + 1).join(', ');
      alert(`Please answer all questions before submitting.\n\nUnanswered questions: ${questionNumbers}`);
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const passed = scorePercent >= quiz.passing_score;
    setScore(scorePercent);
    setSubmitted(true);

    await supabase.from('lesson_quiz_attempts').insert({
      user_id: user?.id,
      lesson_quiz_id: quiz.id,
      score: scorePercent,
      passed,
      answers,
      question_order: questions.map(q => q.id)
    });

    if (passed && lessonId) {
      await supabase.from('lesson_completions').upsert({
        user_id: user?.id,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      });
    }
  }

  if (!quiz) return <div className="p-8">Loading quiz...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

        {!submitted ? (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-lg shadow">
                <p className="font-semibold mb-3">{idx + 1}. {q.question_text}</p>
                <div className="space-y-2">
                  {q.options.map((opt: string, optIdx: number) => (
                    <label key={optIdx} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={optIdx}
                        onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                        className="w-4 h-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-3xl font-bold mb-4">
              {score >= quiz.passing_score ? 'Passed! ✓' : 'Not Passed'}
            </h2>
            <p className="text-xl mb-6">Your Score: {score}%</p>
            <p className="text-gray-600 mb-6">Passing Score: {quiz.passing_score}%</p>
            {score >= quiz.passing_score && (
              <p className="text-green-600 font-semibold mb-6">
                Lesson marked complete! Next lesson unlocked.
              </p>
            )}
            <div className="flex gap-4 justify-center">
              {score >= quiz.passing_score && lessonId && moduleId ? (
                <button
                  onClick={() => navigate({ type: 'lesson', moduleId, lessonId })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Continue to Next Lesson
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                >
                  Retry Quiz
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
