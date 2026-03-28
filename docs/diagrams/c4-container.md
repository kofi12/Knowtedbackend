# C4 Level 2 — Container Diagram

```mermaid
flowchart TB
    Student["🧑‍🎓 Student"]

    subgraph KnowtedBackend["Knowted Backend (Spring Boot)"]
        direction TB

        subgraph Web["Presentation Layer\n(Spring Web MVC)"]
            SecurityCfg["SecurityConfig\n(JWT + OAuth2 + CORS)"]
            Controllers["Controllers\nHealth · Auth · Student\nCourse · Document\nFlashcard · Quiz · Dashboard"]
        end

        subgraph App["Application Layer\n(Use Cases / Services)"]
            UseCases["Use Cases\nStudentUseCase\nCourseUseCase\nCourseDocumentUseCase\nGCSStorageServiceUseCase\nDashboardUseCase\nFlashcardUseCase\nQuizUseCase"]
        end

        subgraph DomainLayer["Domain Layer"]
            Entities["Entities & Aggregates\nStudent · Course · CourseDocument\nStudyAid · FlashcardDeck · Flashcard\nQuiz · QuizQuestion · QuestionOption\nQuizAttempt · QuizAttemptAnswer"]
            Exceptions["Domain Exceptions\nGlobalExceptionHandler"]
        end

        subgraph Infra["Infrastructure Layer\n(Adapters)"]
            Auth["Auth Adapters\nJwtUtil\nJwtAuthenticationFilter\nOAuth2SuccessHandler\nStudentUserDetailsService"]
            Repos["JPA Repositories\n(Spring Data JPA)"]
            Storage["Storage Adapter\nGCSStorageService\nNoopStorageService"]
            Flyway["DB Migrations\n(Flyway)"]
        end
    end

    Frontend["Knowted Frontend\n(Next.js SPA)"]
    GoogleOAuth["Google OAuth2"]
    OpenAI["OpenAI API"]
    GCS["Google Cloud Storage"]
    DB[("PostgreSQL")]

    Student -->|HTTPS| Frontend
    Frontend -->|REST + JWT| SecurityCfg
    SecurityCfg --> Controllers
    Controllers --> UseCases
    UseCases --> Entities
    UseCases --> Repos
    UseCases --> Storage
    UseCases -->|Chat Completions API| OpenAI
    Auth -->|OAuth2 flow| GoogleOAuth
    Repos -->|JDBC| DB
    Flyway -->|Schema migrations| DB
    Storage -->|GCP SDK| GCS
```

## Container Responsibilities

| Container | Technology | Responsibility |
|---|---|---|
| **Presentation Layer** | Spring Web MVC, Spring Security | Route HTTP requests, enforce auth/CORS, map to/from DTOs. |
| **Application Layer** | Spring `@Service` | Orchestrate business workflows; coordinate domain, repos, and external ports. |
| **Domain Layer** | Plain Java (JPA annotations) | Encode business rules (e.g., 50-doc limit, quiz grading, answer snapshots). |
| **Infrastructure — Auth** | JJWT, Spring OAuth2 | JWT issuance/validation, Google OAuth2 callback handling. |
| **Infrastructure — Repos** | Spring Data JPA + Hibernate | Persistence adapters for all entities; custom JPQL queries for performance. |
| **Infrastructure — Storage** | Google Cloud Storage SDK | File upload, download, V4 presigned URL generation; `noop` adapter for dev/test. |
| **Infrastructure — Migrations** | Flyway | Version-controlled DDL applied at startup. |
