# Requirements Traceability Matrix

## Study Aids Generation

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Rollout |
|---|---|---|---|---|---|---|
| REQ-SA-001 | Generate quiz from selected course documents. | `POST /api/study-aids/generate`, `GET /api/study-aids/{studyAidId}` | `StudyAid`, `StudyAidGenerationJob`, `RequestStudyAidGenerationUseCase`, `ProcessStudyAidJobUseCase`, `LlmGenerationPort` | `StudyAidTest`, `StudyAidGenerationJobTest`, controller/use-case tests (to be added for generate flow) | Given valid owned documents and `QUIZ` type, request is accepted, a job is queued, and persisted quiz payload is retrievable when complete. | Phase 1 |
| REQ-SA-002 | Generate flashcards from selected course documents. | `POST /api/study-aids/generate`, `GET /api/study-aids/{studyAidId}` | `StudyAid`, `StudyAidGenerationJob`, flashcard domain entities, Grok adapter implementation of `LlmGenerationPort` | `StudyAidTest`, `StudyAidGenerationJobTest`, flashcard generation integration tests (to be added) | Given valid owned documents and `FLASHCARD_DECK` type, request is accepted, generation completes, and ordered flashcards are returned. | Phase 1 |
| REQ-SA-003 | Expose async status and support retry-safe processing. | `GET /api/study-aids/jobs/{jobId}` | `StudyAidGenerationStatus`, `StudyAidGenerationJob`, `StudyAidJobQueuePort`, queue adapter | `StudyAidGenerationJobTest` | Job transitions enforce `PENDING -> PROCESSING -> DONE/FAILED`, failed jobs can be safely re-queued, and polling reflects latest status. | Phase 1 |
| REQ-SA-004 | Enforce authorization and ownership checks. | `POST /api/study-aids/generate`, `GET /api/courses/{courseId}/study-aids` | `StudyAidController`, ownership validation in request use case, JWT principal-based user resolution | Controller auth tests (to be added), existing auth/controller test suite patterns | Users can only request/retrieve study aids for courses/documents they own; unauthorized/forbidden requests are rejected. | Phase 1 |
| REQ-SA-005 | Apply prompt safety and bounded context retrieval. | Internal generation pipeline (no direct endpoint) | `DocumentTextExtractionPort`, `ContextRetrievalPort`, prompt template/versioning in Grok adapter | Adapter contract tests (to be added) | Prompt context is bounded and delimited; injected instructions from documents do not override system rules; malformed LLM output is rejected. | Phase 1 |
| REQ-SA-006 | Emit operational telemetry and capture failure diagnostics. | `GET /api/study-aids/jobs/{jobId}` (observable effect) | `StudyAidGenerationJob` (`retryCount`, failure details, model metadata), worker metrics/timers (to be added) | Job lifecycle tests + future metrics assertions | Failed jobs store diagnostic details, retries are countable, and generation stages are observable through logs/metrics. | Phase 1 |

## Notes

- This RTM intentionally maps both current artifacts and planned near-term artifacts from the Grok rollout.
- Gaps marked "to be added" are tracked for subsequent implementation slices (controller/use-case/integration layers).
- Requirement IDs are stable and should be referenced in PRs, test names, and release notes for rollout traceability.
