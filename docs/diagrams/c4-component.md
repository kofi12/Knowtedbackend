# C4 Level 3 — Component Diagram (Knowted Backend)

```mermaid
flowchart LR
    Client(["Frontend / API Client"])

    subgraph Security["Security Boundary"]
        SCfg["SecurityConfig"]
        JwtFilter["JwtAuthenticationFilter"]
        OAuthHandler["OAuth2SuccessHandler"]
        JwtUtil["JwtUtil"]
        UDS["StudentUserDetailsService"]
    end

    subgraph Controllers["Controllers"]
        CtlHealth["HealthController\nGET /api/health"]
        CtlAuth["AuthController\nPOST /api/auth/logout"]
        CtlStudent["StudentController\nGET /api/me"]
        CtlCourse["CourseController\n/api/courses/**"]
        CtlDoc["CourseDocumentController\n/api/documents/**\n/api/courses/{id}/documents"]
        CtlDash["DashboardController\n/api/dashboard/**"]
        CtlFlash["FlashcardController\n/api/courses/{id}/flashcards/**\n/api/flashcards/decks/**"]
        CtlQuiz["QuizController\n/api/courses/{id}/quizzes/**\n/api/quizzes/**"]
    end

    subgraph UseCases["Use Cases"]
        UCStudent["StudentUseCase"]
        UCCourse["CourseUseCase"]
        UCDocRead["CourseDocumentUseCase"]
        UCDocWrite["GCSStorageServiceUseCase"]
        UCDash["DashboardUseCase"]
        UCFlash["FlashcardUseCase"]
        UCQuiz["QuizUseCase"]
    end

    subgraph Repos["Repositories (JPA)"]
        RStudent["StudentRepository"]
        RCourse["JPACourseRepository"]
        RDoc["JPACourseDocumentRepository"]
        RStudyAid["JPAStudyAidRepository"]
        RDeck["JPAFlashcardDeckRepository"]
        RQuiz["JPAQuizRepository"]
        RAttempt["JPAQuizAttemptRepository"]
    end

    subgraph Ports["External Ports"]
        StorageSvc["StorageService\n(GCSStorageService)"]
        OpenAI["OpenAI RestClient"]
        Tika["Apache Tika"]
    end

    Client --> SCfg
    SCfg --> JwtFilter
    SCfg --> OAuthHandler
    JwtFilter --> JwtUtil
    JwtFilter --> UDS
    UDS --> RStudent
    OAuthHandler --> JwtUtil
    OAuthHandler --> RStudent

    SCfg --> CtlHealth
    SCfg --> CtlAuth
    SCfg --> CtlStudent
    SCfg --> CtlCourse
    SCfg --> CtlDoc
    SCfg --> CtlDash
    SCfg --> CtlFlash
    SCfg --> CtlQuiz

    CtlStudent --> UCStudent
    UCStudent --> RStudent

    CtlCourse --> UCCourse
    UCCourse --> RCourse
    UCCourse --> RDoc
    UCCourse --> StorageSvc

    CtlDoc --> UCDocRead
    CtlDoc --> UCDocWrite
    UCDocRead --> RDoc
    UCDocRead --> RCourse
    UCDocRead --> StorageSvc
    UCDocWrite --> RCourse
    UCDocWrite --> RDoc
    UCDocWrite --> StorageSvc

    CtlDash --> UCDash
    UCDash --> RCourse
    UCDash --> RDoc
    UCDash --> RStudyAid

    CtlFlash --> UCFlash
    UCFlash --> RDoc
    UCFlash --> RStudyAid
    UCFlash --> RDeck
    UCFlash --> StorageSvc
    UCFlash --> Tika
    UCFlash --> OpenAI

    CtlQuiz --> UCQuiz
    UCQuiz --> RDoc
    UCQuiz --> RStudyAid
    UCQuiz --> RQuiz
    UCQuiz --> RAttempt
    UCQuiz --> StorageSvc
    UCQuiz --> Tika
    UCQuiz --> OpenAI
```

## Component Descriptions

| Component | Layer | Role |
|---|---|---|
| `SecurityConfig` | Infrastructure | Defines filter chain, CORS, OAuth2 login, JWT resource server, and bearer token resolver. |
| `JwtAuthenticationFilter` | Infrastructure | Extracts JWT from request, validates via `JwtUtil`, populates `SecurityContext`. |
| `OAuth2SuccessHandler` | Infrastructure | Post-Google-login: upserts Student, issues JWT, redirects frontend. |
| `JwtUtil` | Infrastructure | HMAC-SHA512 JWT generation, validation, and claim extraction. |
| `StudentUserDetailsService` | Infrastructure | Spring Security `UserDetailsService` that loads `Student` by UUID. |
| `*Controller` | Presentation | HTTP entry points: validates input, extracts principal, delegates to use cases. |
| `StudentUseCase` | Application | Look up student profile by ID. |
| `CourseUseCase` | Application | CRUD for courses; best-effort GCS cleanup on delete. |
| `CourseDocumentUseCase` | Application | Read/delete documents; cross-course document bank; presigned URL generation. |
| `GCSStorageServiceUseCase` | Application | Validate file type, upload to GCS, persist `CourseDocument`. |
| `DashboardUseCase` | Application | Aggregate summary counts and recent activity for dashboard. |
| `FlashcardUseCase` | Application | End-to-end flashcard generation: Tika → OpenAI → persist; CRUD for decks. |
| `QuizUseCase` | Application | End-to-end quiz generation; grading logic for MCQ/MCQ_MULTI attempts; attempt CRUD. |
| `JPA Repositories` | Infrastructure | Spring Data JPA adapters with custom JPQL queries for ownership and JOIN-fetch patterns. |
| `GCSStorageService` | Infrastructure | GCP SDK adapter for file upload, download, delete, V4 presigned URL. |
| `Apache Tika` | Infrastructure | Text extraction from PDF, DOCX, PPTX, TXT, and image files. |
| `OpenAI RestClient` | Infrastructure | Spring `RestClient` calling OpenAI Chat Completions to generate flashcard/quiz JSON. |
