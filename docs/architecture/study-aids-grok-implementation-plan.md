# Study Aids Grok Implementation Plan

## Goal

Deliver Grok-powered study aid generation from uploaded course documents, starting with `QUIZ` and `FLASHCARD_DECK`, while preserving DDD boundaries and keeping vendor-specific details inside infrastructure adapters.

## Current Baseline

- Document upload/list/delete is already available via `CourseDocumentController`.
- `StudyAid` exists as metadata but generation orchestration is not implemented.
- Frontend generation UI currently does not call backend APIs.

## DDD Boundaries

- **Domain**
  - Entities and invariants: `StudyAid`, `StudyAidGenerationJob`, quiz/flashcard entities.
  - Value objects for generation lifecycle and model metadata.
  - State machines: `PENDING -> PROCESSING -> DONE | FAILED`.
- **Application**
  - Use cases orchestrate flow:
    - `RequestStudyAidGenerationUseCase`
    - `ProcessStudyAidJobUseCase`
    - `GetStudyAidUseCase`
  - Depends on ports only (no provider SDK knowledge).
- **Infrastructure**
  - Implement ports:
    - `LlmGenerationPort` via xAI Grok adapter.
    - `DocumentTextExtractionPort` via Tika extractor.
    - `ContextRetrievalPort` via SQL/lexical retrieval.
    - `StudyAidJobQueuePort` via DB-polling worker.
- **Presentation**
  - `StudyAidController` exposes request/retrieve/status endpoints and maps DTOs.
  - JWT principal and ownership checks mirror current document controller conventions.

## Grok Integration Plan

- Use HTTP client (`WebClient` or `RestClient`) against `https://api.x.ai/v1`.
- Authenticate with bearer token from environment-backed config.
- Keep Grok-specific request/response mapping in infrastructure.
- Force structured output schema for quiz/flashcard generation.
- Validate parsed output before persistence to prevent malformed payload persistence.

## Async Generation Workflow

1. `POST /api/study-aids/generate` validates ownership and input constraints.
2. Persist `StudyAid` + `StudyAidGenerationJob` with `PENDING`.
3. Enqueue job ID through `StudyAidJobQueuePort`.
4. Background worker:
   - extracts source text,
   - chunks/retrieves bounded context,
   - invokes Grok generation adapter,
   - parses and validates response.
5. Persist generated quiz/flashcards and set terminal status (`DONE` or `FAILED`).
6. Frontend polls `GET /api/study-aids/jobs/{jobId}` and renders results on completion.

## Data Model Evolution

- Add `study_aid_generation_jobs`:
  - `job_id`, `study_aid_id`, `requested_by_user_id`
  - `status`, `retry_count`
  - provider/model/prompt metadata
  - failure fields (`error_code`, `error_message`)
  - queue and processing timestamps
- Keep existing `study_aids` table and move generation lifecycle to explicit status transitions.
- Follow forward-only Flyway migrations (`V5+`).

## Security And Guardrails

- Enforce ownership checks for courses/documents at request time.
- Apply per-user/per-course rate limits and max document count per generation request.
- Harden prompts by delimiting trusted context and ignoring instruction overrides in content.
- Enforce timeout, retry policy, and token/context budgets.
- Persist operational trace fields (model, prompt version, failure reason) for audits.

## Testing Strategy

- **Domain tests:** state transition invariants for `StudyAid` and job lifecycle.
- **Use case tests:** orchestration with mocked ports and retry paths.
- **Infrastructure tests:** Grok adapter contract tests using mocked HTTP server.
- **Controller tests:** validation/auth/ownership error mappings.
- **E2E tests:** upload documents -> request generation -> poll status -> fetch final study aid.

## Rollout Phases

- **Phase 1 (MVP)**
  - Quiz + flashcards generation.
  - DB-backed async jobs and polling endpoint.
  - Tika extraction + lexical retrieval.
- **Phase 2**
  - Retrieval quality upgrades (reranking/embeddings).
  - Better generation controls and dashboard UX.
- **Phase 3**
  - New study aid types (study guides, schedules).
  - Analytics loop and personalized generation strategies.

## Risks And Mitigations

- **Malformed model output:** strict schema validation + fail-fast persistence guard.
- **Latency/cost spikes:** token budgets, context chunk limits, retry backoff.
- **Prompt injection from docs:** context isolation and non-overridable system constraints.
- **Operational blind spots:** metrics/timers per stage plus structured failure storage.
