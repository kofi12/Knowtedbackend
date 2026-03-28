# Class Diagram - Domain Model

```mermaid
classDiagram
    class Student {
      +UUID studentId
      +String email
      +String displayName
      +String passwordHash
      +String authProvider
      +String providerUserId
      +Instant createdAt
      +Instant updatedAt
      +createFromGoogle(String googleSub, String email, String displayName)$ Student
    }

    class Course {
      +UUID courseId
      +UUID userId
      +String code
      +String name
      +String term
      +Instant createdAt
      +Instant updatedAt
      +List~CourseDocument~ courseDocuments
      +addCourseDocument(CourseDocument doc) void
      +removeCourseDocument(CourseDocument doc) void
    }

    class CourseDocument {
      +UUID documentId
      +UUID userId
      +Course course
      +String originalFilename
      +String storageKey
      +String storageBucket
      +String contentType
      +Long fileSizeBytes
      +String fileHashSha256
      +String uploadStatus
      +Instant uploadedAt
      +create(Course course, UUID uploadedBy, String storageKey, String storageBucket, String originalFilename, String contentType, long fileSizeBytes)$ CourseDocument
    }

    class StudyAid {
      +UUID studyAidId
      +UUID userId
      +Course course
      +UUID documentId
      +Short typeId
      +String title
      +String generationStatus
      +Instant createdAt
      +Instant updatedAt
      +create(UUID userId, Course course, UUID documentId, Short typeId, String title)$ StudyAid
    }

    class FlashcardDeck {
      +UUID deckId
      +List~Flashcard~ flashcards
      +addFlashcard(Flashcard card) void
    }

    class Flashcard {
      +Long flashcardId
      +FlashcardDeck deck
      +String frontText
      +String backText
      +int orderIndex
      +Instant createdAt
    }

    class Quiz {
      +UUID quizId
      +Integer timeLimitSeconds
      +boolean randomizeQuestions
      +List~QuizQuestion~ questions
    }

    class QuizQuestion {
      +Long questionId
      +Quiz quiz
      +String questionText
      +String questionType
      +int points
      +int orderIndex
      +List~QuestionOption~ options
      +addOption(QuestionOption option) void
    }

    class QuestionOption {
      +Long optionId
      +QuizQuestion question
      +String optionText
      +boolean isCorrect
      +int orderIndex
    }

    class QuizAttempt {
      +Long attemptId
      +UUID userId
      +Quiz quiz
      +Instant startedAt
      +Instant completedAt
      +BigDecimal score
      +Integer totalPoints
      +List~QuizAttemptAnswer~ answers
      +complete(BigDecimal score, int totalPoints) void
      +addAnswer(QuizAttemptAnswer answer) void
    }

    class QuizAttemptAnswer {
      +Long attemptAnswerId
      +QuizAttempt attempt
      +Long questionId
      +Long selectedOptionId
      +String questionTextSnapshot
      +String selectedOptionTextSnapshot
      +Boolean isCorrect
      +Instant answeredAt
    }

    %% Ownership
    Student "1" --> "0..*" Course : owns via userId
    Student "1" --> "0..*" StudyAid : owns via userId
    Student "1" --> "0..*" CourseDocument : owns via userId

    %% Course aggregate
    Course "1" *-- "0..50" CourseDocument : contains (max 50)
    Course "1" --> "0..*" StudyAid : scopes

    %% Study Aid specialisations (shared PK)
    StudyAid "1" -- "0..1" FlashcardDeck : typeId=1 (deckId = studyAidId)
    StudyAid "1" -- "0..1" Quiz : typeId=2 (quizId = studyAidId)

    %% Flashcard aggregate
    FlashcardDeck "1" *-- "0..*" Flashcard : contains

    %% Quiz aggregate
    Quiz "1" *-- "1..*" QuizQuestion : contains
    QuizQuestion "1" *-- "1..*" QuestionOption : contains
    Quiz "1" --> "0..*" QuizAttempt : has attempts
    QuizAttempt "1" *-- "0..*" QuizAttemptAnswer : records
```

## Aggregate Boundaries

| Aggregate Root | Owned Entities |
|---|---|
| `Course` | `CourseDocument` (max 50) |
| `StudyAid` | `FlashcardDeck` → `Flashcard[]` (typeId=1), or `Quiz` → `QuizQuestion[]` → `QuestionOption[]` (typeId=2) |
| `QuizAttempt` | `QuizAttemptAnswer[]` |

## Key Design Notes

- `FlashcardDeck.deckId` and `Quiz.quizId` are **foreign keys** to `StudyAid.studyAidId` (shared-PK inheritance pattern).
- `QuizAttemptAnswer` stores text **snapshots** at submission time so grading history is immutable even if quiz content changes.
- Ownership is tracked via `userId` on `Course`, `CourseDocument`, and `StudyAid` rather than a direct FK to `Student`, allowing lightweight identity checks without cross-aggregate joins.
- `Course.addCourseDocument()` enforces the 50-document business rule at the domain level.
