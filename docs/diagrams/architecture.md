# Backend Architecture Diagram

```mermaid
flowchart TD
    Client[Frontend / API Client]

    subgraph Presentation
      SecurityConfig[SecurityConfig]
      JwtFilter[JwtAuthenticationFilter]
      OAuthHandler[OAuth2SuccessHandler]
      CtlStudents[StudentController]
      CtlCourses[CourseController]
      CtlDashboard[DashboardController]
      CtlDocs[CourseDocumentController]
      CtlHealth[HealthController]
    end

    subgraph Application_Use_Cases
      UCStudent[Student profile flow]
      UCCourse[CourseUseCase]
      UCDashboard[DashboardUseCase]
      UCDocRead[CourseDocumentUseCase]
      UCDocUpload[GCSStorageServiceUseCase]
    end

    subgraph Domain_Infra
      StudentRepo[StudentRepository]
      CourseRepo[JPACourseRepository]
      DocRepo[JPACourseDocumentRepository]
      StorageSvc[StorageService]
      JwtUtil[JwtUtil]
    end

    subgraph External_Systems
      Postgres[(PostgreSQL)]
      GCS[(Google Cloud Storage)]
      GoogleOAuth[Google OAuth2]
    end

    Client --> SecurityConfig
    SecurityConfig --> JwtFilter
    SecurityConfig --> OAuthHandler
    SecurityConfig --> CtlStudents
    SecurityConfig --> CtlCourses
    SecurityConfig --> CtlDashboard
    SecurityConfig --> CtlDocs
    SecurityConfig --> CtlHealth

    JwtFilter --> JwtUtil
    JwtFilter --> StudentRepo
    OAuthHandler --> GoogleOAuth
    OAuthHandler --> StudentRepo
    OAuthHandler --> JwtUtil

    CtlStudents --> UCStudent
    UCStudent --> StudentRepo

    CtlCourses --> UCCourse
    UCCourse --> CourseRepo
    UCCourse --> DocRepo
    UCCourse --> StorageSvc

    CtlDashboard --> UCDashboard
    UCDashboard --> CourseRepo
    UCDashboard --> DocRepo

    CtlDocs --> UCDocRead
    CtlDocs --> UCDocUpload
    UCDocRead --> CourseRepo
    UCDocRead --> DocRepo
    UCDocRead --> StorageSvc
    UCDocUpload --> CourseRepo
    UCDocUpload --> DocRepo
    UCDocUpload --> StorageSvc

    StudentRepo --> Postgres
    CourseRepo --> Postgres
    DocRepo --> Postgres
    StorageSvc --> GCS
```

## Notes
- Security is centralized in `SecurityConfig` with JWT resource-server support and OAuth2 login.
- Request authentication can come from bearer header, token cookie, or token query parameter resolver.
- Upload and document access flows use `StorageService` abstraction with GCS-backed implementation in production/docker profile.
