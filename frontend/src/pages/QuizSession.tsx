// pages/QuizSession.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchCourseQuestions } from '../lib/api';

type Question = {
  id: string;
  type: string;
  questionText: string;
  answer: string;
  options?: string[];
};

export function QuizSession() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selected = searchParams.get('selected')?.split(',') || [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false); // for flashcards
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!courseId) return;
        const data = await fetchCourseQuestions(courseId);
        const filtered = selected.length > 0
          ? data.filter((q: Question) => selected.includes(q.id))
          : data;
        setQuestions(filtered);
      } catch (err) {
        console.error('Quiz load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId, selected]);

  const current = questions[currentIndex];

  const handleFlip = () => setFlipped(!flipped);

  const handleMCQSelect = (choice: string) => {
    setUserAnswer(choice);
    setFeedback(choice === current?.answer ? 'correct' : 'incorrect');
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  const goBack = () => navigate(`/course/${courseId}/bank`);

  if (loading) return <div className="flex justify-center items-center min-h-[70vh]"><Loader2 className="animate-spin h-12 w-12" /></div>;

  if (!current) {
    return (
      <div className="text-center min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">No questions available</h2>
        <button onClick={goBack} className="btn-primary">Back to Bank</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" /> Back to Bank
        </button>
        <div className="text-sm">
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-8 min-h-[400px] flex flex-col">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
          {current.questionText}
        </h2>

        {current.type.includes('flashcard') && (
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`w-full max-w-md h-64 perspective-1000 cursor-pointer`}
              onClick={handleFlip}
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center p-6 shadow-lg">
                  <p className="text-lg font-medium text-center">Front (question)</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl flex items-center justify-center p-6 shadow-lg">
                  <p className="text-lg font-medium text-center">{current.answer}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {current.type === 'multiple_choice' && current.options && (
          <div className="space-y-4 flex-1">
            {current.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleMCQSelect(opt)}
                disabled={!!feedback}
                className={`w-full p-4 text-left border rounded-lg transition ${feedback
                    ? opt === current.answer
                      ? 'bg-green-100 border-green-500'
                      : opt === userAnswer
                        ? 'bg-red-100 border-red-500'
                        : ''
                    : 'hover:bg-muted'
                  }`}
              >
                {opt}
              </button>
            ))}
            {feedback && (
              <div className="mt-4 text-center flex items-center justify-center gap-2">
                {feedback === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span className={feedback === 'correct' ? 'text-green-600' : 'text-red-600'}>
                  {feedback === 'correct' ? 'Correct!' : `Incorrect. Answer: ${current.answer}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Add handling for true_false, fill_blank similarly */}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={nextQuestion}
          disabled={currentIndex >= questions.length - 1}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          Next <RotateCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}