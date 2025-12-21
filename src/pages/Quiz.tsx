import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronRight, XCircle } from 'lucide-react';
import { supabase, Quiz as QuizType, QuizQuestion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { Sidebar } from '../components/Sidebar';

type Props = {
  moduleId: string;
  quizId: string;
};

export function Quiz({ moduleId, quizId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextModuleId, setNextModuleId] = useState<string | null>(null);
  const [isLastModule, setIsLastModule] = useState(false);
  const [attemptData, setAttemptData] = useState<any>(null);

  useEffect(() => {
    loadQuizData();
    checkForNextModule();
  }, [quizId, moduleId]);

  async function loadQuizData() {
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('order_index'),
    ]);

    if (quizRes.data) setQuiz(quizRes.data);
    if (questionsRes.data) {
      const shuffled = [...questionsRes.data].sort(() => Math.random() - 0.5).map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      }));
      setQuestions(shuffled);
    }

    setLoading(false);
  }

  async function checkForNextModule() {
    try {
      const { data: currentModule } = await supabase
        .from('modules')
        .select('order_index')
        .eq('id', moduleId)
        .single();

      if (currentModule) {
        const { data: nextModule } = await supabase
          .from('modules')
          .select('id, order_index')
          .gt('order_index', currentModule.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextModule) {
          setNextModuleId(nextModule.id);
          setIsLastModule(false);
        } else {
          setNextModuleId(null);
          setIsLastModule(true);
        }
      }
    } catch (error) {
      console.error('Error checking for next module:', error);
    }
  }

  async function handleSubmit() {
    if (!user || !quiz) return;

    const unansweredQuestions = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => answers[q.id] === undefined);

    if (unansweredQuestions.length > 0) {
      const questionNumbers = unansweredQuestions.map(({ idx }) => idx + 1).join(', ');
      alert(`Please answer all questions before submitting.\n\nUnanswered questions: ${questionNumbers}`);
      return;
    }

    setSubmitting(true);

    let correctCount = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const didPass = scorePercent >= quiz.passing_score;

    const { data: newAttemptData } = await supabase.from('quiz_attempts').insert([
      {
        user_id: user.id,
        quiz_id: quizId,
        score: scorePercent,
        passed: didPass,
        answers: answers,
        question_order: questions.map(q => q.id),
      },
    ]).select();

    setScore(scorePercent);
    setPassed(didPass);
    setAttemptData(newAttemptData);
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    loadQuizData();
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

  if (!quiz) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">Quiz not found</div>
        </div>
      </div>
    );
  }

  if (submitted) {
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

            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              {passed ? (
                <>
                  <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                  <p className="text-gray-600 mb-4">You passed the quiz with a score of {score}%</p>
                  <p className="text-sm text-gray-500 mb-6">
                    {isLastModule
                      ? 'You have completed all modules in the Medicare Mastery Program!'
                      : 'The next module has been unlocked for you.'}
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => navigate({ type: 'quizReview', attemptId: attemptData?.[0]?.id || '' })}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                    >
                      Review Answers
                    </button>
                    {isLastModule ? (
                      <>
                        <button
                          onClick={() => navigate('/certificate')}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                        >
                          View Certificate
                        </button>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
                        >
                          Go to Dashboard
                        </button>
                      </>
                    ) : nextModuleId ? (
                      <>
                        <button
                          onClick={() => navigate({ type: 'module', id: nextModuleId })}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                        >
                          Continue to Next Module
                          <ChevronRight size={20} />
                        </button>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
                        >
                          Go to Dashboard
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Go to Dashboard
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto mb-4 text-red-600" size={64} />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Not Quite There</h2>
                  <p className="text-gray-600 mb-4">
                    You scored {score}%. You need {quiz.passing_score}% to pass.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Review the lessons and try again when you're ready.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate({ type: 'module', id: moduleId })}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Review Lessons
                    </button>
                  </div>
                </>
              )}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">
              Answer all questions to complete this quiz. You need {quiz.passing_score}% to pass.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {index + 1}. {question.question_text}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === optionIndex}
                        onChange={() =>
                          setAnswers({ ...answers, [question.id]: optionIndex })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length || submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
