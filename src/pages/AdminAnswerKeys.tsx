import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';

export default function AdminAnswerKeys() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [answerKeys, setAnswerKeys] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadQuizzes();
  }, [user]);

  useEffect(() => {
    if (selectedQuiz) loadAnswerKeys();
  }, [selectedQuiz]);

  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) setProfile(data);
  }

  async function loadQuizzes() {
    const { data } = await supabase
      .from('quizzes')
      .select('*, modules(title)')
      .order('created_at');

    setQuizzes(data || []);
  }

  async function loadAnswerKeys() {
    const { data } = await supabase
      .from('teacher_answer_keys')
      .select('*, quiz_questions(question_text)')
      .eq('quiz_id', selectedQuiz);

    setAnswerKeys(data || []);
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <p className="text-red-800">Access denied. Admin only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Teacher Answer Keys</h1>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <label className="block font-semibold mb-2">Select Quiz:</label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose a quiz...</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.modules?.title} - {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {answerKeys.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Question</th>
                    <th className="px-6 py-3 text-left">Correct Answer</th>
                    <th className="px-6 py-3 text-left">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {answerKeys.map(key => (
                    <tr key={key.id}>
                      <td className="px-6 py-4">{key.quiz_questions?.question_text}</td>
                      <td className="px-6 py-4 font-semibold">Option {key.correct_answer + 1}</td>
                      <td className="px-6 py-4 text-gray-600">{key.explanation || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
