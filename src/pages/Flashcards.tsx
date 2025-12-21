import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentRoute } from '../hooks/useNavigate';

export default function Flashcards() {
  const route = useCurrentRoute();
  const lessonId = typeof route === 'object' && route.type === 'flashcardsLesson' ? route.lessonId : null;
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, [lessonId]);

  async function loadFlashcards() {
    const query = supabase
      .from('flashcards')
      .select('*')
      .order('order_index');

    if (lessonId) {
      query.eq('lesson_id', lessonId);
    }

    const { data } = await query;
    setFlashcards(data || []);
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Flashcards</h1>

        {flashcards.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No flashcards available yet.</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-center text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </div>

            <div
              onClick={() => setFlipped(!flipped)}
              className="bg-white rounded-lg shadow-lg p-12 min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <p className="text-xl font-semibold mb-2">
                  {flipped ? 'Answer:' : 'Question:'}
                </p>
                <p className="text-lg">
                  {flipped ? currentCard.back_text : currentCard.front_text}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                  setFlipped(false);
                }}
                disabled={currentIndex === 0}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFlipped(!flipped)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Flip Card
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1));
                  setFlipped(false);
                }}
                disabled={currentIndex === flashcards.length - 1}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
