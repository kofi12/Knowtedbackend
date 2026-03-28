# Backend Architecture Diagram

```mermaid
flowchart TD
    Client[Frontend / API Client]

    subgraph Presentation["Presentation Layer"]
      SecurityConfig[SecurityConfig]
      JwtFilter[JwtAuthenticationFilter]
      OAuthHandler[OAuth2SuccessHandler]
      CtlHealth[HealthController]
      CtlAuth[AuthController]
      CtlStudents[StudentController]
      CtlCourses[CourseController]
      CtlDashboard[DashboardController]
      CtlDocs[CourseDocumentController]
      CtlFlashcards[FlashcardController]
      CtlQuizzes[QuizController]
    end

    subgraph Application["Application Layer (Use Cases)"]
      UCStudent[StudentUseCase]
      UCCourse[CourseUseCase]
      UCDashboard[DashboardUseCase]
      UCDocRead[CourseDocumentUseCase]
      UCDocUpload[GCSStorageServiceUseCase]
      UCFlashcard[FlashcardUseCase]
      UCQuiz[QuizUseCase]
    end

    subgraph Domain["Domain Layer"]
      Student[Student]
      Course[Course]
      CourseDocument[CourseDocument]
      StudyAid[StudyAid]
      FlashcardDeck[FlashcardDeck]
      Flashcard[Flashcard]
      Quiz[Quiz]
      QuizQuestion[QuizQuestion]
      QuestionOption[QuestionOption]
      QuizAttempt[QuizAttempt]
    end

    subgraph Infrastructure["Infrastructure Layer"]
      StudentRepo[StudentRepository]
      CourseRepo[JPACourseRepository]
      DocRepo[JPACourseDocumentRepository]
      StudyAidRepo[JPAStudyAidRepository]
      FlashcardRepo[JPAFlashcardDeckRepository]
      QuizRepo[JPAQuizRepository]
      AttemptRepo[JPAQuizAttemptRepository]
      StorageSvc[StorageService]
      JwtUtil[JwtUtil]
      Tika[Apache Tika]
    end

    subgraph External["External Systems"]
      Postgres[(PostgreSQL)]
      GCS[(Google Cloud Storage)]
      GoogleOAuth[Google OAuth2]
      OpenAI[OpenAI Chat API]
    end

    Client --> SecurityConfig
    SecurityConfig --> JwtFilter
    SecurityConfig --> OAuthHandler

    JwtFilter --> JwtUtil
    JwtFilter --> StudentRepo
    OAuthHandler --> GoogleOAuth
    OAuthHandler --> StudentRepo
    OAuthHandler --> JwtUtil

    SecurityConfig --> CtlHealth
    SecurityConfig --> CtlAuth
    SecurityConfig --> CtlStudents
    SecurityConfig --> CtlCourses
    SecurityConfig --> CtlDashboard
    SecurityConfig --> CtlDocs
    SecurityConfig --> CtlFlashcards
    SecurityConfig --> CtlQuizzes

    CtlStudents --> UCStudent
    UCStudent --> StudentRepo

    CtlCourses --> UCCourse
    UCCourse --> CourseRepo
    UCCourse --> DocRepo
    UCCourse --> StorageSvc

    CtlDashboard --> UCDashboard
    UCDashboard --> CourseRepo
    UCDashboard --> DocRepo
    UCDashboard --> StudyAidRepo

    CtlDocs --> UCDocRead
    CtlDocs --> UCDocUpload
    UCDocRead --> CourseRepo
    UCDocRead --> DocRepo
    UCDocRead --> StorageSvc
    UCDocUpload --> CourseRepo
    UCDocUpload --> DocRepo
    UCDocUpload --> StorageSvc

    CtlFlashcards --> UCFlashcard
    UCFlashcard --> DocRepo
    UCFlashcard --> StudyAidRepo
    UCFlashcard --> FlashcardRepo
    UCFlashcard --> StorageSvc
    UCFlashcard --> Tika
    UCFlashcard --> OpenAI

    CtlQuizzes --> UCQuiz
    UCQuiz --> DocRepo
    UCQuiz --> StudyAidRepo
    UCQuiz --> QuizRepo
    UCQuiz --> AttemptRepo
    UCQuiz --> StorageSvc
    UCQuiz --> Tika
    UCQuiz --> OpenAI

    StudentRepo --> Postgres
    CourseRepo --> Postgres
    DocRepo --> Postgres
    StudyAidRepo --> Postgres
    FlashcardRepo --> Postgres
    QuizRepo --> Postgres
    AttemptRepo --> Postgres
    StorageSvc --> GCS
```

## Notes

- Security is centralized in `SecurityConfig` with JWT resource-server support and OAuth2 login.
- Token resolution checks Authorization header, `token` cookie, and `token` query parameter.
- Upload and document-access flows are split between `GCSStorageServiceUseCase` (write) and `CourseDocumentUseCase` (read/delete).
- `FlashcardUseCase` and `QuizUseCase` orchestrate text extraction (Tika), AI generation (OpenAI), and persistence in a single synchronous transaction.
- `StorageService` is a port with two adapters: `GCSStorageService` (production) and `NoopStorageService` (test/dev).
