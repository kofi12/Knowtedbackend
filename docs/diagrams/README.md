# Backend Diagrams

This folder contains Mermaid diagrams for the Knowted backend, organized by abstraction level following the C4 model and DDD layering.

## How to view

Open any `.md` file in VS Code / Cursor (with Mermaid preview) or GitHub to render the diagrams. Alternatively, paste any `mermaid` block into [mermaid.live](https://mermaid.live).

---

## C4 Architecture Diagrams (high → low abstraction)

| File | C4 Level | What it shows |
|---|---|---|
| [c4-system-context.md](c4-system-context.md) | Level 1 — System Context | Knowted in relation to external actors (Student, Google, OpenAI, GCS, PostgreSQL). |
| [c4-container.md](c4-container.md) | Level 2 — Container | Internal containers within the Spring Boot backend (Presentation, Application, Domain, Infrastructure). |
| [c4-component.md](c4-component.md) | Level 3 — Component | Every controller, use case, repository, and external port with their wiring. |
| [architecture.md](architecture.md) | Flowchart overview | End-to-end component flow from Client → Controllers → Use Cases → Repos → External Systems. |

---

## Class Diagrams

| File | Scope |
|---|---|
| [class-domain.md](class-domain.md) | Full domain model: all entities, aggregates, value relationships, and business-rule methods. |
| [class-application.md](class-application.md) | Application layer: all use case classes with method signatures and repository dependencies. |
| [class-repositories-storage.md](class-repositories-storage.md) | Repository interfaces (domain ports + JPA adapters) and storage port/adapters. |
| [class-security-auth.md](class-security-auth.md) | Security components: `SecurityConfig`, `JwtUtil`, `JwtAuthenticationFilter`, `OAuth2SuccessHandler`. |

---

## Sequence Diagrams

| File | Flow |
|---|---|
| [sequence-oauth-login.md](sequence-oauth-login.md) | Google OAuth2 login → JWT issuance → frontend redirect. |
| [sequence-api-me.md](sequence-api-me.md) | Authenticated profile fetch (`GET /api/me`) with JWT validation. |
| [sequence-document-upload.md](sequence-document-upload.md) | Multipart document upload → GCS storage → presigned URL response. |
| [sequence-flashcard-generation.md](sequence-flashcard-generation.md) | Flashcard deck generation: Tika text extraction → OpenAI → persist deck. |
| [sequence-quiz-generation.md](sequence-quiz-generation.md) | Quiz generation: GCS download → Tika → OpenAI (MCQ or MCQ_MULTI) → persist quiz. |
| [sequence-quiz-attempt.md](sequence-quiz-attempt.md) | Quiz attempt submission: grading logic, snapshot storage, score calculation. |

---

## DDD Layering Reference

```
Presentation  →  Application  →  Domain  ←  Infrastructure
(Controllers)    (Use Cases)    (Entities)   (JPA, GCS, JWT, Tika, OpenAI)
```

- **Domain** entities hold business rules (50-doc limit, quiz grading, snapshot immutability).
- **Application** use cases orchestrate cross-entity workflows and call external ports.
- **Infrastructure** provides adapters for persistence, storage, AI generation, and auth.
- **Presentation** handles HTTP concerns only (routing, auth principal extraction, DTO mapping).
