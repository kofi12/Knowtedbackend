// pages/QuestionBank.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ListChecks, ArrowLeft, Loader2 } from 'lucide-react';
import { fetchCourseQuestions, CourseQuestionItem } from '../lib/api';

type Question = CourseQuestionItem & {
  courseId?: string;
  createdAt?: string;
};

export function QuestionBank() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const data = await fetchCourseQuestions(courseId);
        setQuestions(data);
      } catch (err) {
        setError('Failed to load question bank. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  const startQuiz = () => {
    if (selectedIds.length === 0) {
      alert('Select at least one question to start a quiz.');
      return;
    }
    navigate(`/course/${courseId}/quiz?selected=${selectedIds.join(',')}`);
  };

  const goBack = () => navigate(`/course/${courseId}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Question Bank</h1>
        </div>
        {questions.length > 0 && (
          <button
            onClick={startQuiz}
            disabled={selectedIds.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <ListChecks className="h-5 w-5" />
            Start Quiz ({selectedIds.length})
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No questions yet</h2>
          <p className="text-muted-foreground mb-6">
            Generate some study aids in the course details page!
          </p>
          <button onClick={goBack} className="btn-primary">
            Back to Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div
              key={q.id}
              className={`p-4 border rounded-lg flex items-start gap-4 hover:bg-muted/50 transition ${
                selectedIds.includes(q.id) ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(q.id)}
                onChange={() => toggleSelect(q.id)}
                className="mt-1.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                    {q.type.replace('_', ' ')}
                  </span>
                  {/* Add createdAt if useful */}
                </div>
                <p className="font-medium">{q.questionText}</p>
                {q.type === 'flashcards' && (
                  <p className="text-sm text-muted-foreground mt-1">Answer: {q.answer}</p>
                )}
                {q.type === 'multiple_choice' && q.options && (
                  <ul className="text-sm mt-2 space-y-1">
                    {q.options.map((opt, i) => (
                      <li key={i} className={opt === q.answer ? 'text-green-600 font-medium' : ''}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}