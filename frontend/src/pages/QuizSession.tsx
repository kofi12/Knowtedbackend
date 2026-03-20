import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { mockQuizQuestions } from '../lib/mockData';
import { useCourses } from '../lib/CoursesContext';

export function QuizSession() {
  const navigate = useNavigate();
  const { courseId, aidId } = useParams<{ courseId: string; aidId?: string }>();
  const { courses } = useCourses();

  const course = courses.find((item) => item.id === courseId);
  const questions = useMemo(() => {
    const matches = mockQuizQuestions.filter((question) => {
      if (question.courseId !== courseId) {
        return false;
      }

      if (aidId && question.aidId !== aidId) {
        return false;
      }

      return true;
    });

    if (matches.length > 0) {
      return matches;
    }

    return [
      {
        id: `${courseId}-intro-1`,
        courseId: courseId ?? '',
        prompt: `Which statement best describes the goal of studying ${course?.name ?? 'this course'}?`,
        answers: [
          'Memorizing every sentence without context',
          'Building understanding you can apply in practice',
          'Skipping all review and practice',
          'Only reading the title of each chapter',
        ] as [string, string, string, string],
        correctAnswer: 'Building understanding you can apply in practice',
        explanation: 'Good quiz practice checks whether you can use concepts, not just recognize them.',
      },
      {
        id: `${courseId}-intro-2`,
        courseId: courseId ?? '',
        prompt: 'What makes a multiple-choice question fair and useful for learning?',
        answers: [
          'All four answers are correct',
          'It has one clear best answer and plausible distractors',
          'It hides the question from the learner',
          'It changes the rules after submission',
        ] as [string, string, string, string],
        correctAnswer: 'It has one clear best answer and plausible distractors',
        explanation: 'Strong quiz questions have one correct answer and distractors that still require real thinking.',
      },
    ];
  }, [aidId, course?.name, courseId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const currentAnswer = submittedAnswers[currentQuestion?.id];
  const isAnswered = Boolean(currentAnswer);
  const isCorrect = currentAnswer === currentQuestion?.correctAnswer;
  const score = questions.reduce((total, question) => {
    return total + (submittedAnswers[question.id] === question.correctAnswer ? 1 : 0);
  }, 0);
  const isFinished = questions.length > 0 && Object.keys(submittedAnswers).length === questions.length;

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    setSubmittedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedAnswer(submittedAnswers[questions[nextIndex].id] ?? null);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    const previousIndex = currentIndex - 1;
    setCurrentIndex(previousIndex);
    setSelectedAnswer(submittedAnswers[questions[previousIndex].id] ?? null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmittedAnswers({});
  };

  if (!courseId || !currentQuestion) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Quiz not available</h2>
        <p className="max-w-md text-muted-foreground">
          We could not find quiz questions for this course yet.
        </p>
        <Button onClick={() => navigate(courseId ? `/course/${courseId}` : '/')}>Back to course</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate(`/course/${courseId}`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Button>
        <div className="text-sm text-muted-foreground">
          {course?.name ?? 'Quiz'} · Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-2 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="space-y-8 p-6 md:p-8">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Multiple Choice
            </div>
            <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
              {currentQuestion.prompt}
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose one answer from the four options below.
            </p>
          </div>

          <div className="grid gap-3">
            {currentQuestion.answers.map((answer, index) => {
              const optionLabel = String.fromCharCode(65 + index);
              const showCorrect = isAnswered && answer === currentQuestion.correctAnswer;
              const showIncorrect = isAnswered && answer === currentAnswer && answer !== currentQuestion.correctAnswer;

              return (
                <button
                  key={answer}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelectedAnswer(answer)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                    showCorrect
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : showIncorrect
                        ? 'border-destructive bg-destructive/10'
                        : selectedAnswer === answer
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold">
                    {optionLabel}
                  </div>
                  <div
                    className={`flex-1 pt-1 text-sm md:text-base ${
                      selectedAnswer === answer || showCorrect || showIncorrect
                        ? 'font-semibold'
                        : 'font-medium'
                    }`}
                  >
                    {answer}
                  </div>
                  {showCorrect && <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" />}
                  {showIncorrect && <XCircle className="mt-1 h-5 w-5 text-destructive" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`rounded-2xl border p-4 ${isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-destructive/40 bg-destructive/10'}`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                )}
                <div className="space-y-1">
                  <p className="font-medium">
                    {isCorrect ? 'Correct answer.' : `Not quite. The correct answer is ${currentQuestion.correctAnswer}.`}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <div className="text-sm text-muted-foreground">
              Score: {score} / {questions.length}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                Previous
              </Button>
              {!isAnswered ? (
                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                  Submit answer
                </Button>
              ) : currentIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>Next question</Button>
              ) : (
                <Button onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                  Restart quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Quiz complete</h2>
              <p className="text-sm text-muted-foreground">
                You answered {score} out of {questions.length} correctly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
