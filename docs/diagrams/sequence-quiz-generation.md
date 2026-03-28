# Sequence Diagram - Quiz Generation

```mermaid
sequenceDiagram
    actor Client
    participant QC as QuizController
    participant QU as QuizUseCase
    participant DocRepo as JPACourseDocumentRepository
    participant SARepo as JPAStudyAidRepository
    participant QuizRepo as JPAQuizRepository
    participant GCS as GCSStorageService
    participant Tika as Apache Tika
    participant OpenAI as OpenAI Chat API

    Client->>+QC: POST /api/courses/{courseId}/quizzes/generate\n?documentId={id}&questionType=MCQ|MCQ_MULTI&title=?
    QC->>+QU: generateQuiz(userId, courseId, documentId, questionType, title)

    QU->>+DocRepo: findById(documentId)
    DocRepo-->>-QU: CourseDocument

    QU->>+GCS: download(storageKey)
    GCS-->>-QU: byte[]

    QU->>+Tika: parseToString(bytes)
    Tika-->>-QU: extractedText

    QU->>QU: cap text at 15,000 chars

    QU->>+SARepo: save(StudyAid{status=PENDING, typeId=2})
    SARepo-->>-QU: StudyAid (studyAidId)

    QU->>+QuizRepo: save(Quiz{quizId=studyAidId})
    QuizRepo-->>-QU: Quiz

    alt questionType = MCQ
        QU->>+OpenAI: POST /chat/completions\n(prompt: 10 MCQ questions, 5 options, 1 correct each)
    else questionType = MCQ_MULTI
        QU->>+OpenAI: POST /chat/completions\n(prompt: 10 MCQ_MULTI questions, 5 options, 2-5 correct each)
    end
    OpenAI-->>-QU: JSON array of 10 question objects

    QU->>QU: parse JSON\nbuild QuizQuestion + QuestionOption entities\n(orderIndex 0–9 per question, 0–4 per option)
    QU->>QuizRepo: save(Quiz with questions and options)

    QU->>SARepo: update(studyAidId, status=DONE)
    QU-->>-QC: QuizResponseDto

    QC-->>Client: 201 Created\nQuizResponseDto

    note over QU,OpenAI: On any exception: StudyAid.status = FAILED,\nexception propagates → 500 response
```

## Notes

- Unlike flashcard generation, quiz generation **always** requires an existing `documentId` — direct file upload is not supported on the quiz endpoint.
- The `questionType` parameter controls the system prompt sent to OpenAI: MCQ enforces exactly 1 correct option; MCQ_MULTI enforces 2–5 correct options per question.
- `StudyAid` and `Quiz` records are created before the OpenAI call so failure state can be persisted.
- Questions and options are saved with `orderIndex` fields to guarantee deterministic retrieval order.
- The whole method is `@Transactional`; a failed save after a successful OpenAI call results in a full rollback.
