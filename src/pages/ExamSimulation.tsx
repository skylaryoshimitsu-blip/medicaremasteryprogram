import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';

export default function ExamSimulation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentVersion, setCurrentVersion] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadNextVersion();
  }, []);

  useEffect(() => {
    if (!timerActive || submitted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, submitted, answers, questions]);

  async function loadNextVersion() {
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*, exam_versions!inner(version_number)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(1);

    let versionNumber = 1;
    if (attempts && attempts.length > 0) {
      const lastAttempt = attempts[0];
      if (!lastAttempt.passed) {
        const lastVersion = (lastAttempt as any).exam_versions?.version_number || 1;
        const randomVersions = [2, 3, 4, 5].filter(v => v !== lastVersion);
        versionNumber = randomVersions[Math.floor(Math.random() * randomVersions.length)];
      }
    }

    setCurrentVersion(versionNumber);
    await loadQuestions(versionNumber);
  }

  async function loadQuestions(versionNumber: number) {
    const { data: versionData } = await supabase
      .from('exam_versions')
      .select('id')
      .eq('version_number', versionNumber)
      .maybeSingle();

    if (!versionData) {
      console.error('Exam version not found');
      return;
    }

    const { data: questionsData } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('version_id', versionData.id)
      .order('question_number');

    if (questionsData && questionsData.length > 0) {
      const formatted = questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correct_answer: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer),
        question_number: q.question_number
      }));

      const shuffled = [...formatted].sort(() => Math.random() - 0.5).map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      }));

      setQuestions(shuffled);
      setTimerActive(true);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  async function handleSubmit(autoSubmit = false) {
    if (!autoSubmit) {
      const unansweredQuestions = questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => answers[q.id] === undefined);

      if (unansweredQuestions.length > 0) {
        const questionNumbers = unansweredQuestions.map(({ idx }) => idx + 1).join(', ');
        alert(`Please answer all questions before submitting.\n\nUnanswered questions: ${questionNumbers}`);
        return;
      }
    }

    setTimerActive(false);
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    const { data: versionData } = await supabase
      .from('exam_versions')
      .select('id')
      .eq('version_number', currentVersion)
      .maybeSingle();

    if (versionData) {
      await supabase.from('exam_attempts').insert({
        user_id: user?.id,
        version_id: versionData.id,
        score: scorePercent,
        passed: scorePercent >= 87,
        answers,
        time_remaining: timeRemaining
      });
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">Exam questions are being prepared by admin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Exam Simulation - Version {String.fromCharCode(64 + currentVersion)}</h1>
            <p className="text-gray-600">100 Questions | Passing Score: 87%</p>
          </div>
          {!submitted && (
            <div className={`text-2xl font-bold px-6 py-3 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          )}
        </div>

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
              onClick={() => handleSubmit(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Submit Exam
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-3xl font-bold mb-4">
              {score >= 87 ? 'Congratulations! You Passed!' : 'Not Passed - Try Next Version'}
            </h2>
            <p className="text-xl mb-6">Your Score: {score}%</p>
            <p className="text-gray-600 mb-6">Required: 87%</p>
            {score < 87 && (
              <p className="text-sm text-gray-500 mb-4">
                You will receive a random version (B-E) on your next attempt.
              </p>
            )}
            {score >= 87 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">Upload your state exam passing screenshot to unlock Phase 5:</p>
                <button
                  onClick={() => navigate('/phase-unlock')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Upload Screenshot & Unlock Phase 5
                </button>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {score >= 87 ? 'Retake Exam' : 'Try Again'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
