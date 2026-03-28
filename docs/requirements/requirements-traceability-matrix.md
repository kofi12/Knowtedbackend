# Requirements Traceability Matrix

## Overview

This matrix provides full traceability from functional requirements through implementation artifacts and test coverage. All features of the Knowted backend are tracked here. Requirement IDs are stable and should be referenced in PRs, test names, and release notes.

---

## 1. Authentication & Identity

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-AUTH-001 | The system shall expose a health endpoint for uptime checks. | `GET /api/health` | `HealthController` | `HealthControllerTest` | Returns `200` with body `backend is up`. | Implemented |
| REQ-AUTH-002 | The system shall authenticate API users with JWT bearer tokens. | All `/api/**` except `/api/health` | `SecurityConfig`, `JwtAuthenticationFilter`, `JwtUtil` | `StudentControllerTest` (auth header tests) | Requests without valid auth receive `401`; valid tokens are accepted. | Implemented |
| REQ-AUTH-003 | The system shall support Google OAuth2 login and auto-provision student accounts. | `GET /oauth2/authorization/google`, `GET /login/oauth2/code/google` | `OAuth2SuccessHandler`, `StudentRepository`, `JwtUtil`, `Student.createFromGoogle()` | OAuth2 integration tests (to be added) | Successful Google login creates/updates Student record and issues JWT; redirects frontend with token query param. | Implemented |
| REQ-AUTH-004 | The system shall resolve bearer tokens from Authorization header, HttpOnly cookie, and query parameter. | All `/api/**` | `SecurityConfig` (custom `BearerTokenResolver`) | Token resolution tests (to be added) | Valid JWT in any of the three positions is accepted and the request proceeds as authenticated. | Implemented |
| REQ-AUTH-005 | The system shall support logout by invalidating the session cookie. | `POST /api/auth/logout` | `AuthController` | Auth logout tests (to be added) | Response clears the `token` cookie (maxAge=0, HttpOnly, Secure, SameSite=Lax) and returns `204`. | Implemented |
| REQ-AUTH-006 | The system shall return the currently authenticated student profile. | `GET /api/me` | `StudentController`, `StudentUseCase`, `StudentRepository` | `StudentControllerTest` | Returns `200` with `studentId`, `email`, and `displayName` for valid JWT subject. | Implemented |
| REQ-AUTH-007 | The system shall reject malformed student IDs in JWT subject claims. | `GET /api/me` | `StudentController` (UUID validation) | `StudentControllerTest` | Returns `400` when JWT `sub` is not a valid UUID. | Implemented |

---

## 2. Courses

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-CRS-001 | The system shall list all courses for a specified user. | `GET /api/courses?userId=` | `CourseController`, `CourseUseCase`, `JPACourseRepository` | `CourseControllerTest` | Returns `200` with an array of course DTOs containing `courseId`, `name`, `code`, `term`, `materialCount`. | Implemented |
| REQ-CRS-002 | The system shall create a course for a specified user. | `POST /api/courses?userId=` | `CourseController`, `CourseUseCase`, `JPACourseRepository` | `CourseControllerTest` | Returns `200` with created course DTO from valid `{ name, code?, term? }` payload. | Implemented |
| REQ-CRS-003 | The system shall retrieve a single course by ID for a specified user. | `GET /api/courses/{courseId}?userId=` | `CourseController`, `CourseUseCase`, `JPACourseRepository` | `CourseControllerTest` | Returns `200` when found and accessible; `404` when not found. | Implemented |
| REQ-CRS-004 | The system shall partially update course fields. | `PATCH /api/courses/{courseId}?userId=` | `CourseController`, `CourseUseCase`, `JPACourseRepository` | `CourseControllerTest` | Returns `200` with updated course DTO; only supplied fields are modified. | Implemented |
| REQ-CRS-005 | The system shall delete a specified course and cascade-delete all associated documents and study aids. | `DELETE /api/courses/{courseId}?userId=` | `CourseController`, `CourseUseCase`, `JPACourseRepository`, `StorageService` | `CourseControllerTest` | Returns `200`; all associated documents are removed from storage (best-effort) and metadata is deleted via DB cascade. | Implemented |
| REQ-CRS-006 | The system shall enforce a maximum of 50 documents per course. | `POST /api/courses/{courseId}/documents` | `Course.addCourseDocument()` | Document upload limit test (to be added) | Uploading the 51st document to a course returns a client error. | Implemented |

---

## 3. Documents

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-DOC-001 | The system shall upload a file as a course document to configured cloud storage. | `POST /api/courses/{courseId}/documents` | `CourseDocumentController`, `GCSStorageServiceUseCase`, `GCSStorageService`, `CourseDocument` | Document upload integration tests (to be added) | Accepts multipart `file`; returns `201` with document metadata and presigned URL. | Implemented |
| REQ-DOC-002 | The system shall validate uploaded document content type against an allowlist. | `POST /api/courses/{courseId}/documents` | `GCSStorageServiceUseCase` (MIME + extension validation), `InvalidFileTypeException` | File type validation tests (to be added) | PDF, DOCX, DOC, TXT, JPEG, PNG, GIF, PPTX are accepted; all other types return `400`. | Implemented |
| REQ-DOC-003 | The system shall enforce a 25 MB file size limit on uploads. | `POST /api/courses/{courseId}/documents` | Spring multipart config, `GlobalExceptionHandler` (`MaxUploadSizeExceededException`) | File size limit test (to be added) | Files exceeding 25 MB are rejected with `413 Payload Too Large`. | Implemented |
| REQ-DOC-004 | The system shall list paginated documents within a course. | `GET /api/courses/{courseId}/documents` | `CourseDocumentController`, `CourseDocumentUseCase`, `JPACourseDocumentRepository` | Document list tests (to be added) | Returns `200` with ordered document metadata; supports `page` and `size` query params; sorted by `uploadedAt` DESC. | Implemented |
| REQ-DOC-005 | The system shall return metadata for a specific document. | `GET /api/documents/{documentId}` | `CourseDocumentController`, `CourseDocumentUseCase`, `JPACourseDocumentRepository` | Document metadata tests (to be added) | Returns `200` with document metadata when document exists and requester owns it; `403` when not owner; `404` when not found. | Implemented |
| REQ-DOC-006 | The system shall generate temporary signed URLs for document access. | `GET /api/documents/{documentId}/presigned-url` | `CourseDocumentController`, `CourseDocumentUseCase`, `StorageService.getPresignedUrl()` | Presigned URL tests (to be added) | Returns `200` with `presignedUrl` (HTTPS, V4-signed, GET-only) and `expiresAt`; default expiry 3600 seconds. | Implemented |
| REQ-DOC-007 | The system shall delete a document record and its storage object. | `DELETE /api/documents/{documentId}` | `CourseDocumentController`, `CourseDocumentUseCase`, `StorageService.delete()` | Document delete tests (to be added) | Returns `204`; GCS blob is removed (best-effort) and DB record is deleted; requester must own the document. | Implemented |
| REQ-DOC-008 | The system shall expose a cross-course document bank with optional filename search and course filter. | `GET /api/documents` | `CourseDocumentController`, `CourseDocumentUseCase.listAllUserDocuments()`, `JPACourseDocumentRepository` | Document bank tests (to be added) | Returns `200` with all documents owned by the authenticated user; supports `search` (filename substring) and `courseId` (filter) query params; sorted by `uploadedAt` DESC. | Implemented |

---

## 4. Flashcards

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-FL-001 | The system shall generate a flashcard deck from a course document using AI. | `POST /api/courses/{courseId}/flashcards/generate` | `FlashcardController`, `FlashcardUseCase`, `StudyAid`, `FlashcardDeck`, `Flashcard`, OpenAI RestClient, Apache Tika | Flashcard generation tests (to be added) | Given a valid `documentId` or uploaded `file`, returns `201` with `FlashcardDeckResponseDto` containing exactly 10 flashcards; `StudyAid.generationStatus` transitions to `DONE`. | Implemented |
| REQ-FL-002 | The system shall extract text from uploaded documents using Apache Tika before AI generation. | Internal generation pipeline | `FlashcardUseCase` (Tika), `QuizUseCase` (Tika), `StorageService.download()` | Text extraction unit tests (to be added) | PDF, DOCX, TXT, and PPTX files are parsed to plain text; text is capped at 15,000 characters before submission to OpenAI. | Implemented |
| REQ-FL-003 | The system shall persist failed flashcard generation and surface status to the caller. | `POST /api/courses/{courseId}/flashcards/generate` | `FlashcardUseCase` (catch block sets status=FAILED), `StudyAid.generationStatus` | Generation failure tests (to be added) | When OpenAI call fails, `StudyAid.generationStatus` is set to `FAILED`; caller receives an appropriate error response. | Implemented |
| REQ-FL-004 | The system shall list all flashcard decks for a course. | `GET /api/courses/{courseId}/flashcards` | `FlashcardController`, `FlashcardUseCase.listDecks()`, `JPAStudyAidRepository` | Flashcard list tests (to be added) | Returns `200` with all `FLASHCARD_DECK` study aids (with cards) for the given course owned by the authenticated user. | Implemented |
| REQ-FL-005 | The system shall retrieve a single flashcard deck by ID. | `GET /api/flashcards/decks/{deckId}` | `FlashcardController`, `FlashcardUseCase.getDeck()`, `JPAFlashcardDeckRepository` | Flashcard get tests (to be added) | Returns `200` with the deck and all flashcards; ownership enforced via `userId`; `403` if not owner; `404` if not found. | Implemented |
| REQ-FL-006 | The system shall delete a flashcard deck and all associated flashcards. | `DELETE /api/flashcards/decks/{deckId}` | `FlashcardController`, `FlashcardUseCase.deleteDeck()`, `JPAStudyAidRepository`, `JPAFlashcardDeckRepository` | Flashcard delete tests (to be added) | Returns `204`; cascade deletes: `StudyAid` → `FlashcardDeck` → `Flashcard` records. | Implemented |

---

## 5. Quizzes

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-QZ-001 | The system shall generate a multiple-choice quiz from a course document using AI. | `POST /api/courses/{courseId}/quizzes/generate` | `QuizController`, `QuizUseCase`, `StudyAid`, `Quiz`, `QuizQuestion`, `QuestionOption`, OpenAI RestClient, Apache Tika | Quiz generation tests (to be added) | Given a valid `documentId`, returns `201` with `QuizResponseDto` containing 10 questions, each with 5 options; `StudyAid.generationStatus` is `DONE`. | Implemented |
| REQ-QZ-002 | The system shall support both single-select (MCQ) and multi-select (MCQ_MULTI) question types. | `POST /api/courses/{courseId}/quizzes/generate?questionType=` | `QuizUseCase` (prompt differentiation), `QuizQuestion.questionType` | Question type tests (to be added) | `MCQ` questions have exactly 1 correct option; `MCQ_MULTI` questions have 2–5 correct options; both types are generated, stored, and retrieved correctly. | Implemented |
| REQ-QZ-003 | The system shall list all quizzes for a course. | `GET /api/courses/{courseId}/quizzes` | `QuizController`, `QuizUseCase.listQuizzes()`, `JPAStudyAidRepository` | Quiz list tests (to be added) | Returns `200` with all `QUIZ` study aids (with questions and options) for the course owned by the authenticated user. | Implemented |
| REQ-QZ-004 | The system shall retrieve a single quiz with all questions and options. | `GET /api/quizzes/{quizId}` | `QuizController`, `QuizUseCase.getQuiz()`, `JPAQuizRepository` | Quiz get tests (to be added) | Returns `200` with the quiz, all questions (ordered), and all options (ordered); `403` if not owner; `404` if not found. | Implemented |
| REQ-QZ-005 | The system shall delete a quiz and all associated questions, options, and attempts. | `DELETE /api/quizzes/{quizId}` | `QuizController`, `QuizUseCase.deleteQuiz()`, `JPAStudyAidRepository` | Quiz delete tests (to be added) | Returns `204`; cascade deletes: `StudyAid` → `Quiz` → `QuizQuestion` → `QuestionOption`; all `QuizAttempt` records are also removed. | Implemented |
| REQ-QZ-006 | The system shall persist failed quiz generation and surface status to the caller. | `POST /api/courses/{courseId}/quizzes/generate` | `QuizUseCase` (catch block sets status=FAILED) | Quiz generation failure tests (to be added) | When OpenAI call fails, `StudyAid.generationStatus` is set to `FAILED`; caller receives an appropriate error response. | Implemented |

---

## 6. Quiz Attempts & Grading

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-QZA-001 | The system shall accept and grade a student's quiz attempt submission. | `POST /api/quizzes/{quizId}/attempts` | `QuizController`, `QuizUseCase.submitAttempt()`, `QuizAttempt`, `QuizAttemptAnswer`, `JPAQuizAttemptRepository` | Quiz attempt submission tests (to be added) | Accepts `{ answers: Map<questionId, [optionIds]> }`; grades MCQ (1 correct) and MCQ_MULTI (all correct required); persists attempt; returns `201` with score percentage and answer breakdown. | Implemented |
| REQ-QZA-002 | The system shall store immutable answer snapshots to preserve grading history. | `POST /api/quizzes/{quizId}/attempts` | `QuizAttemptAnswer` (`questionTextSnapshot`, `selectedOptionTextSnapshot`, `isCorrect`) | Snapshot integrity tests (to be added) | Each `QuizAttemptAnswer` stores the question and selected option text at submission time; these values are unaffected by later edits to the quiz. | Implemented |
| REQ-QZA-003 | The system shall list all attempts for a quiz by the authenticated user. | `GET /api/quizzes/{quizId}/attempts` | `QuizController`, `QuizUseCase.listAttempts()`, `JPAQuizAttemptRepository` | List attempts tests (to be added) | Returns `200` with attempts sorted by `startedAt` DESC, scoped to the authenticated user. | Implemented |
| REQ-QZA-004 | The system shall retrieve a single attempt with full answer detail. | `GET /api/quizzes/attempts/{attemptId}` | `QuizController`, `QuizUseCase.getAttempt()`, `JPAQuizAttemptRepository` | Get attempt tests (to be added) | Returns `200` with attempt including all `AttemptAnswerDto`s (with `isCorrect`, snapshots, and `score`); ownership enforced. | Implemented |

---

## 7. Dashboard

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-DASH-001 | The system shall return dashboard summary metrics for a user. | `GET /api/dashboard/summary?userId=` | `DashboardController`, `DashboardUseCase.getSummary()`, `JPACourseRepository`, `JPACourseDocumentRepository`, `JPAStudyAidRepository` | `DashboardControllerTest` | Returns `200` with `activeCourses`, `studyMaterials` (document count), and `generatedAids` (study aid count). | Implemented |
| REQ-DASH-002 | The system shall return recent dashboard activity with optional course and limit filters. | `GET /api/dashboard/recent?userId=` | `DashboardController`, `DashboardUseCase.getRecent()`, `JPACourseDocumentRepository`, `JPAStudyAidRepository` | `DashboardControllerTest` | Returns `200` with `recentDocuments` and `recentStudyAids`; supports optional `courseId` (ownership validated) and `limit` (1–50, default 5); items sorted by recency DESC. | Implemented |

---

## 8. Study Aid Generation Infrastructure

| Requirement ID | Requirement | Endpoints | Code Artifacts | Test Artifacts | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|
| REQ-SA-001 | The system shall use OpenAI Chat API to generate study aids from document text. | Internal AI pipeline | `FlashcardUseCase`, `QuizUseCase`, Spring `RestClient` (OpenAI), `${OPENAI_API_KEY}`, `${OPENAI_MODEL}` | OpenAI adapter contract tests (to be added) | System prompt and user prompt construct a valid chat completion request; JSON response is parsed correctly; malformed JSON causes generation to fail gracefully. | Implemented |
| REQ-SA-002 | The system shall link generated study aids to a course and optionally to a source document. | Internal | `StudyAid` (`courseId`, `documentId`), `FlashcardDeck`/`Quiz` share primary key with `StudyAid` | Study aid linkage tests (to be added) | Each `StudyAid` record references both the owning course and (optionally) the source document; the relationship is preserved in all retrieval queries. | Implemented |
| REQ-SA-003 | The system shall track study aid generation status through PENDING, DONE, and FAILED states. | `GET /api/flashcards/decks/{deckId}`, `GET /api/quizzes/{quizId}` | `StudyAid.generationStatus`, `FlashcardUseCase`, `QuizUseCase` | Generation lifecycle tests (to be added) | Status starts as `PENDING` on creation, transitions to `DONE` on success, and to `FAILED` on any exception; status is accurately reflected in retrieval responses. | Implemented |

---

## Endpoint Tracking Matrix

| Req ID | Endpoint | Method | Purpose | Auth | Success | Typical Error Responses | Test Coverage |
|---|---|---|---|---|---|---|---|
| API-001 | `/api/health` | GET | Health check | Public | `200` | n/a | `HealthControllerTest` |
| API-002 | `/api/me` | GET | Current student profile | Required | `200` | `400`, `401`, `404` | `StudentControllerTest` |
| API-003 | `/api/auth/logout` | POST | Clear session cookie | Public | `204` | n/a | Auth tests (to be added) |
| API-004 | `/oauth2/authorization/google` | GET | Initiate Google OAuth2 | Public | Redirect | OAuth errors | Integration tests (to be added) |
| API-005 | `/login/oauth2/code/google` | GET | OAuth2 callback / JWT issuance | Public | Redirect | OAuth errors | Integration tests (to be added) |
| API-006 | `/api/courses` | GET | List courses | Required | `200` | `401` | `CourseControllerTest` |
| API-007 | `/api/courses` | POST | Create course | Required | `200` | `400`, `401` | `CourseControllerTest` |
| API-008 | `/api/courses/{courseId}` | GET | Get course | Required | `200` | `401`, `404` | `CourseControllerTest` |
| API-009 | `/api/courses/{courseId}` | PATCH | Update course | Required | `200` | `400`, `401`, `404` | `CourseControllerTest` |
| API-010 | `/api/courses/{courseId}` | DELETE | Delete course | Required | `200` | `401`, `404` | `CourseControllerTest` |
| API-011 | `/api/dashboard/summary` | GET | Dashboard summary | Required | `200` | `401` | `DashboardControllerTest` |
| API-012 | `/api/dashboard/recent` | GET | Dashboard recent data | Required | `200` | `401` | `DashboardControllerTest` |
| API-013 | `/api/courses/{courseId}/documents` | GET | List course documents | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-014 | `/api/courses/{courseId}/documents` | POST | Upload document | Required | `201` | `400`, `401`, `403`, `404`, `413` | Tests (to be added) |
| API-015 | `/api/documents` | GET | Document bank (all user docs) | Required | `200` | `401` | Tests (to be added) |
| API-016 | `/api/documents/{documentId}` | GET | Get document metadata | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-017 | `/api/documents/{documentId}/presigned-url` | GET | Get signed download URL | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-018 | `/api/documents/{documentId}` | DELETE | Delete document | Required | `204` | `401`, `403`, `404` | Tests (to be added) |
| API-019 | `/api/courses/{courseId}/flashcards/generate` | POST | Generate flashcard deck | Required | `201` | `400`, `401`, `403`, `404`, `500` | Tests (to be added) |
| API-020 | `/api/courses/{courseId}/flashcards` | GET | List flashcard decks | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-021 | `/api/flashcards/decks/{deckId}` | GET | Get flashcard deck | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-022 | `/api/flashcards/decks/{deckId}` | DELETE | Delete flashcard deck | Required | `204` | `401`, `403`, `404` | Tests (to be added) |
| API-023 | `/api/courses/{courseId}/quizzes/generate` | POST | Generate quiz | Required | `201` | `400`, `401`, `403`, `404`, `500` | Tests (to be added) |
| API-024 | `/api/courses/{courseId}/quizzes` | GET | List quizzes | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-025 | `/api/quizzes/{quizId}` | GET | Get quiz with questions | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-026 | `/api/quizzes/{quizId}` | DELETE | Delete quiz | Required | `204` | `401`, `403`, `404` | Tests (to be added) |
| API-027 | `/api/quizzes/{quizId}/attempts` | POST | Submit quiz attempt | Required | `201` | `400`, `401`, `403`, `404` | Tests (to be added) |
| API-028 | `/api/quizzes/{quizId}/attempts` | GET | List attempts for quiz | Required | `200` | `401`, `403`, `404` | Tests (to be added) |
| API-029 | `/api/quizzes/attempts/{attemptId}` | GET | Get single attempt | Required | `200` | `401`, `403`, `404` | Tests (to be added) |

---

## Notes

- Security policy requires authentication for all `/api/**` except `/api/health` and `/api/auth/logout`.
- Course and dashboard endpoints currently take `userId` as a query parameter rather than deriving it from the JWT subject (unlike document and study-aid endpoints which use JWT principal).
- Requirement IDs are stable and should be referenced in PR titles, test names (`@DisplayName`), and release notes.
- Gaps marked "to be added" are tracked for subsequent implementation slices.
- All study aid generation is synchronous (no background job queue); consider async patterns for long-running AI calls in future phases.
