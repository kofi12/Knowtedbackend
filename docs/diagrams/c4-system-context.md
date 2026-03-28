# C4 Level 1 — System Context Diagram

```mermaid
flowchart TB
    Student["🧑‍🎓 Student\n(Web browser user)"]

    subgraph Knowted["Knowted Platform"]
        Frontend["Knowted Frontend\n(Next.js / React SPA)\nHosted on Vercel"]
        Backend["Knowted Backend\n(Spring Boot REST API)\nHosted on Railway"]
    end

    Google["Google\n(Identity Provider)\nOAuth2 / OpenID Connect"]
    OpenAI["OpenAI\n(AI Service)\nChat Completions API"]
    GCS["Google Cloud Storage\n(Object Storage)\nFile uploads & presigned URLs"]
    Postgres["PostgreSQL\n(Relational Database)\nAll structured data"]

    Student -->|"Uses via browser\n(HTTPS)"| Frontend
    Frontend -->|"REST API calls\n(HTTPS + JWT Bearer)"| Backend
    Frontend -->|"OAuth2 redirect"| Google
    Google -->|"OAuth2 callback + user info"| Backend
    Backend -->|"Generate study aids\n(HTTPS)"| OpenAI
    Backend -->|"Upload / download / sign files\n(GCP SDK)"| GCS
    Backend -->|"Persist entities\n(JDBC/JPA)"| Postgres
```

## Actors & Systems

| Name | Type | Description |
|---|---|---|
| Student | Person | End user who manages courses, uploads documents, and generates/takes study aids. |
| Knowted Frontend | Internal system | Single-page application providing the student UI. |
| Knowted Backend | Internal system | Spring Boot REST API — the subject of all other diagrams. |
| Google | External system | Authenticates students via OAuth2. |
| OpenAI | External system | Generates flashcard and quiz content from document text. |
| Google Cloud Storage | External system | Stores uploaded document files and issues time-limited presigned URLs. |
| PostgreSQL | External system | Persistent relational store for all structured data (courses, documents, study aids, attempts). |
