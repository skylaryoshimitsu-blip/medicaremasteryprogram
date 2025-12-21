import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentRoute, useNavigate } from '../hooks/useNavigate';

export default function QuizReview() {
  const route = useCurrentRoute();
  const attemptId = typeof route === 'object' && route.type === 'quizReview' ? route.attemptId : null;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReview();
  }, [attemptId]);

  async function loadReview() {
    const { data: attemptData } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (!attemptData || !attemptData.passed) {
      navigate('/dashboard');
      return;
    }

    setAttempt(attemptData);

    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', attemptData.quiz_id);

    if (questionsData) {
      const orderedQuestions = attemptData.question_order
        ? attemptData.question_order.map((id: string) =>
            questionsData.find(q => q.id === id)
          ).filter(Boolean)
        : questionsData;
      setQuestions(orderedQuestions);
    }

    setLoading(false);
  }

  if (loading) return <div className="p-8">Loading review...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Quiz Review</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-xl">Score: {attempt.score}%</p>
          <p className="text-green-600 font-semibold">Status: Passed</p>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = attempt.answers?.[q.id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div key={q.id} className="bg-white p-6 rounded-lg shadow">
                <p className="font-semibold mb-3">{idx + 1}. {q.question_text}</p>
                <div className="space-y-2">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isUserChoice = userAnswer === optIdx;
                    const isCorrectAnswer = q.correct_answer === optIdx;

                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded ${
                          isCorrectAnswer
                            ? 'bg-green-100 border border-green-500'
                            : isUserChoice
                            ? 'bg-red-100 border border-red-500'
                            : ''
                        }`}
                      >
                        {opt}
                        {isCorrectAnswer && <span className="ml-2 text-green-700 font-semibold">✓ Correct</span>}
                        {isUserChoice && !isCorrectAnswer && <span className="ml-2 text-red-700">✗ Your answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
