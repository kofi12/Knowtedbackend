# Sequence Diagram - Quiz Attempt Submission & Grading

```mermaid
sequenceDiagram
    actor Client
    participant QC as QuizController
    participant QU as QuizUseCase
    participant QuizRepo as JPAQuizRepository
    participant AttemptRepo as JPAQuizAttemptRepository

    Client->>+QC: POST /api/quizzes/{quizId}/attempts\n{ answers: Map<questionId, [optionIds]> }
    QC->>+QU: submitAttempt(userId, quizId, SubmitQuizRequest)

    QU->>+QuizRepo: findByIdWithQuestionsAndOptions(quizId)
    QuizRepo-->>-QU: Quiz (with all QuizQuestion + QuestionOption entities)

    QU->>QU: verify quiz ownership (userId check)

    QU->>QU: create QuizAttempt(userId, quiz, startedAt=now)

    loop for each QuizQuestion
        QU->>QU: get submitted optionIds for this questionId\n(from request.answers map)

        alt MCQ (single-select)
            QU->>QU: isCorrect = (submittedOptionId == correctOption.optionId)
        else MCQ_MULTI (multi-select)
            QU->>QU: correctOptionIds = options where isCorrect=true\nisCorrect = (submittedSet == correctSet)
        end

        QU->>QU: build QuizAttemptAnswer {\n  questionId, selectedOptionId,\n  questionTextSnapshot,\n  selectedOptionTextSnapshot,\n  isCorrect\n}
        QU->>QU: attempt.addAnswer(answer)
        QU->>QU: accumulate earned points
    end

    QU->>QU: totalPoints = sum of question.points\nscore = (earnedPoints / totalPoints) * 100
    QU->>QU: attempt.complete(score, totalPoints)

    QU->>+AttemptRepo: save(QuizAttempt with all QuizAttemptAnswers)
    AttemptRepo-->>-QU: QuizAttempt (with attemptId)

    QU-->>-QC: QuizAttemptResponseDto {\n  attemptId, quizId, startedAt, completedAt,\n  score, totalPoints,\n  answers: [AttemptAnswerDto]\n}
    QC-->>Client: 201 Created\nQuizAttemptResponseDto
```

## Notes

- The quiz is fetched with a single JOIN query (`findByIdWithQuestionsAndOptions`) to avoid N+1 problems.
- Grading logic is pure Java inside `QuizUseCase` — no external service call.
- MCQ grading: the single submitted option must match the one correct option.
- MCQ_MULTI grading: the set of submitted option IDs must exactly equal the set of all correct option IDs (no partial credit).
- `questionTextSnapshot` and `selectedOptionTextSnapshot` are copied from the live entities at submission time, making the attempt record immutable even if the quiz is later deleted or modified.
- `score` is stored as `BigDecimal` (percentage, 2 decimal places). A perfect score = `100.00`.
- `completedAt` is set inside `attempt.complete()` which also records `totalPoints`.
