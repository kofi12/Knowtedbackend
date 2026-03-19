import React, { useState } from 'react';
import { X, Check, XCircle, Loader2, Trophy, RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { QuizResponseDto, QuizAttemptResponseDto, submitQuizAttempt, listQuizAttempts } from '../lib/api';
import { Button } from './ui/button';

interface QuizViewerProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: QuizResponseDto | null;
}

type ViewState = 'taking' | 'results' | 'history';

export function QuizViewer({ isOpen, onClose, quiz }: QuizViewerProps) {
  const { theme } = useTheme();
  const [viewState, setViewState] = useState<ViewState>('taking');
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResponseDto | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptResponseDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !quiz || quiz.questions.length === 0) return null;

  const isMulti = quiz.questionType === 'MCQ_MULTI';

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => {
      if (isMulti) {
        const current = prev[questionId] ?? [];
        const exists = current.includes(optionId);
        return { ...prev, [questionId]: exists ? current.filter(id => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuizAttempt(quiz.quizId, answers);
      setResult(res);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await listQuizAttempts(quiz.quizId);
      setAttempts(history);
      setViewState('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setViewState('taking');
  };

  const handleClose = () => {
    setAnswers({});
    setResult(null);
    setViewState('taking');
    setAttempts([]);
    onClose();
  };

  const bgColor = theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'white';
  const textColor = theme === 'dark' ? 'hsl(0 0% 100%)' : 'rgb(17 24 39)';
  const borderColor = theme === 'dark' ? 'hsl(217.2 14.3% 30%)' : 'hsl(0 0% 89%)';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div
        className="border rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{ backgroundColor: bgColor, color: textColor, borderColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b" style={{ borderColor }}>
          <div>
            <h2 className="text-lg md:text-xl font-semibold">{quiz.title}</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {quiz.questions.length} questions {isMulti && '(select all that apply)'}
              {viewState === 'taking' && ` \u2022 ${Object.keys(answers).length}/${quiz.questions.length} answered`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {viewState === 'taking' && (
              <Button variant="outline" size="sm" onClick={handleViewHistory} disabled={loadingHistory}>
                {loadingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : 'History'}
              </Button>
            )}
            <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {viewState === 'taking' && quiz.questions.map((q, qi) => (
            <div key={q.questionId} className="space-y-3">
              <p className="font-medium">
                <span className="text-muted-foreground mr-2">{qi + 1}.</span>
                {q.questionText}
                {isMulti && <span className="text-xs text-muted-foreground ml-2">(select all that apply)</span>}
              </p>
              <div className="space-y-2 ml-6">
                {q.options.map(opt => {
                  const selected = (answers[q.questionId] ?? []).includes(opt.optionId);
                  return (
                    <label
                      key={opt.optionId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={`q-${q.questionId}`}
                        checked={selected}
                        onChange={() => handleSelectOption(q.questionId, opt.optionId)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">{opt.optionText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {viewState === 'results' && result && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold">{result.score}%</p>
                <p className="text-muted-foreground mt-1">
                  {result.answers.filter(a => a.isCorrect).length} / {result.totalPoints} correct
                </p>
              </div>

              {quiz.questions.map((q, qi) => {
                const userAnswerIds = (answers[q.questionId] ?? []);
                return (
                  <div key={q.questionId} className="space-y-2">
                    <p className="font-medium">
                      <span className="text-muted-foreground mr-2">{qi + 1}.</span>
                      {q.questionText}
                    </p>
                    <div className="space-y-1.5 ml-6">
                      {q.options.map(opt => {
                        const wasSelected = userAnswerIds.includes(opt.optionId);
                        const isCorrectOpt = opt.isCorrect;
                        let bg = '';
                        if (wasSelected && isCorrectOpt) bg = 'bg-green-500/10 border-green-500/30';
                        else if (wasSelected && !isCorrectOpt) bg = 'bg-red-500/10 border-red-500/30';
                        else if (isCorrectOpt) bg = 'bg-green-500/5 border-green-500/20';

                        return (
                          <div key={opt.optionId} className={`flex items-center gap-3 p-3 rounded-lg border ${bg || 'border-border'}`}>
                            {wasSelected && isCorrectOpt && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                            {wasSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                            {!wasSelected && isCorrectOpt && <Check className="w-4 h-4 text-green-400/60 shrink-0" />}
                            {!wasSelected && !isCorrectOpt && <div className="w-4 h-4 shrink-0" />}
                            <span className="text-sm">{opt.optionText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewState === 'history' && (
            <div className="space-y-3">
              <h3 className="font-semibold">Previous Attempts</h3>
              {attempts.length === 0 && (
                <p className="text-sm text-muted-foreground">No attempts yet.</p>
              )}
              {attempts.map((a, i) => (
                <div key={a.attemptId} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor }}>
                  <div>
                    <p className="font-medium">Attempt {attempts.length - i}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{a.score}%</p>
                    <p className="text-xs text-muted-foreground">
                      {a.answers.filter(ans => ans.isCorrect).length}/{a.totalPoints} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t flex justify-between" style={{ borderColor }}>
          {viewState === 'taking' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length === 0}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Finish Quiz'}
              </Button>
            </>
          )}
          {viewState === 'results' && (
            <>
              <Button variant="outline" onClick={handleViewHistory} disabled={loadingHistory}>
                View History
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetake}>
                  <RotateCcw className="w-4 h-4 mr-2" />Retake
                </Button>
                <Button onClick={handleClose}>Done</Button>
              </div>
            </>
          )}
          {viewState === 'history' && (
            <>
              <Button variant="outline" onClick={() => setViewState('taking')}>Back to Quiz</Button>
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="w-4 h-4 mr-2" />Retake
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
