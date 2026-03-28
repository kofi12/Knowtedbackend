# Test Cases: Quizzes & Quiz Attempts

Covers requirements: REQ-QZ-001 through REQ-QZ-006, REQ-QZA-001 through REQ-QZA-004

---

## TC-QZ-001 — Generate MCQ quiz from document returns 201 with 10 questions

**Requirement**: REQ-QZ-001, REQ-QZ-002
**Type**: Integration (requires OpenAI or stub)
**Priority**: High

**Pre-conditions**: Authenticated user owns the course; document exists with `documentId`; OpenAI is available or stubbed.

**Steps**:
1. Send `POST /api/courses/{courseId}/quizzes/generate?documentId={documentId}&questionType=MCQ`.

**Expected Result**: HTTP `201`; `QuizResponseDto` contains:
- `quizId` (UUID)
- `courseId` matching path param
- `generationStatus = "DONE"`
- `questions` array with exactly 10 items
- Each question has `questionText`, 5 `options`, and exactly 1 option with `isCorrect = true`

---

## TC-QZ-002 — Generate MCQ_MULTI quiz returns questions with multiple correct answers

**Requirement**: REQ-QZ-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Same as TC-QZ-001.

**Steps**:
1. Send `POST /api/courses/{courseId}/quizzes/generate?documentId={documentId}&questionType=MCQ_MULTI`.

**Expected Result**: HTTP `201`; each question has 5 options; at least some questions have 2–5 options with `isCorrect = true`.

---

## TC-QZ-003 — Generate quiz with custom title

**Requirement**: REQ-QZ-001
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course; document exists.

**Steps**:
1. Send `POST /api/courses/{courseId}/quizzes/generate?documentId={documentId}&title=Midterm%20Prep`.

**Expected Result**: HTTP `201`; `QuizResponseDto.title = "Midterm Prep"`.

---

## TC-QZ-004 — Generate quiz without documentId returns 400

**Requirement**: REQ-QZ-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/quizzes/generate` with no `documentId` parameter.

**Expected Result**: HTTP `400 Bad Request`.

---

## TC-QZ-005 — OpenAI failure marks quiz StudyAid as FAILED

**Requirement**: REQ-QZ-006
**Type**: Unit / Integration (stubbed OpenAI error)
**Priority**: High

**Pre-conditions**: OpenAI is stubbed to return an error.

**Steps**:
1. Call `QuizUseCase.generateQuiz()`.

**Expected Result**: A `StudyAid` record is created with `generationStatus = "FAILED"`; an appropriate error propagates to the caller.

---

## TC-QZ-006 — List quizzes for course returns all quizzes

**Requirement**: REQ-QZ-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course has 2 quizzes; authenticated user owns the course.

**Steps**:
1. Send `GET /api/courses/{courseId}/quizzes`.

**Expected Result**: HTTP `200`; array of 2 `QuizResponseDto` objects, each with populated `questions`.

---

## TC-QZ-007 — List quizzes returns empty array for course with none

**Requirement**: REQ-QZ-003
**Type**: Integration
**Priority**: Low

**Pre-conditions**: Course has no quizzes.

**Steps**:
1. Send `GET /api/courses/{courseId}/quizzes`.

**Expected Result**: HTTP `200`; empty array `[]`.

---

## TC-QZ-008 — List quizzes for course owned by another user returns 403

**Requirement**: REQ-QZ-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/courses/{courseId}/quizzes` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-QZ-009 — Get quiz by ID returns questions and options

**Requirement**: REQ-QZ-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Quiz exists; authenticated user owns it.

**Steps**:
1. Send `GET /api/quizzes/{quizId}`.

**Expected Result**: HTTP `200`; `QuizResponseDto` with 10 questions, each with 5 options and `isCorrect` flags.

---

## TC-QZ-010 — Get quiz questions in correct order

**Requirement**: REQ-QZ-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Quiz exists with questions stored at specific `orderIndex` values.

**Steps**:
1. Send `GET /api/quizzes/{quizId}`.
2. Inspect `questions[*].orderIndex`.

**Expected Result**: Questions returned in ascending `orderIndex` order (0–9); options within each question are also in ascending order.

---

## TC-QZ-011 — Get quiz owned by another user returns 403

**Requirement**: REQ-QZ-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Quiz belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/quizzes/{quizId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-QZ-012 — Get nonexistent quiz returns 404

**Requirement**: REQ-QZ-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: No quiz with the given ID exists.

**Steps**:
1. Send `GET /api/quizzes/{unknownId}`.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-QZ-013 — Delete quiz removes StudyAid, Quiz, Questions, Options, and Attempts

**Requirement**: REQ-QZ-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Quiz exists with questions and at least one completed attempt.

**Steps**:
1. Send `DELETE /api/quizzes/{quizId}`.
2. Verify `study_aids` table: no record with `study_aid_id = {quizId}`.
3. Verify `quizzes`, `quiz_questions`, `question_options`, `quiz_attempts`, `quiz_attempt_answers` tables: no records referencing the deleted quiz.

**Expected Result**: HTTP `204`; all cascade records removed.

---

## TC-QZ-014 — Delete quiz owned by another user returns 403

**Requirement**: REQ-QZ-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Quiz belongs to User A; JWT is for User B.

**Steps**:
1. Send `DELETE /api/quizzes/{quizId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`; quiz remains.

---

## TC-QZA-001 — Submit correct MCQ attempt returns score of 100%

**Requirement**: REQ-QZA-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: MCQ quiz with 10 questions exists; all correct option IDs are known.

**Steps**:
1. Build `SubmitQuizRequest.answers` mapping each `questionId` to `[correctOptionId]`.
2. Send `POST /api/quizzes/{quizId}/attempts` with the request body.

**Expected Result**: HTTP `201`; `score = 100.00`; `totalPoints = 10`; all `AttemptAnswerDto.isCorrect = true`.

---

## TC-QZA-002 — Submit MCQ attempt with all wrong answers returns score of 0%

**Requirement**: REQ-QZA-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: MCQ quiz exists; all incorrect option IDs are known.

**Steps**:
1. Build `SubmitQuizRequest.answers` mapping each `questionId` to an incorrect `optionId`.
2. Send `POST /api/quizzes/{quizId}/attempts`.

**Expected Result**: HTTP `201`; `score = 0.00`; all `AttemptAnswerDto.isCorrect = false`.

---

## TC-QZA-003 — Submit MCQ attempt with partial correct answers reflects partial score

**Requirement**: REQ-QZA-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: MCQ quiz with 10 questions; 5 correct, 5 wrong answers provided.

**Steps**:
1. Send `POST /api/quizzes/{quizId}/attempts` with 5 correct and 5 incorrect answer selections.

**Expected Result**: HTTP `201`; `score = 50.00`; exactly 5 `AttemptAnswerDto` items with `isCorrect = true`.

---

## TC-QZA-004 — Submit MCQ_MULTI attempt — partial option selection is graded as incorrect

**Requirement**: REQ-QZA-001, REQ-QZ-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: MCQ_MULTI question has 3 correct options; student selects only 2 of the 3.

**Steps**:
1. Submit attempt with only 2 of 3 correct options for that question.

**Expected Result**: That question's `AttemptAnswerDto.isCorrect = false` (all required correct options must be selected).

---

## TC-QZA-005 — Submit MCQ_MULTI attempt — all correct options selected is graded as correct

**Requirement**: REQ-QZA-001, REQ-QZ-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: MCQ_MULTI question has 3 correct options.

**Steps**:
1. Submit attempt with all 3 correct options selected for that question.

**Expected Result**: That question's `AttemptAnswerDto.isCorrect = true`.

---

## TC-QZA-006 — Answer snapshots preserve question text at submission time

**Requirement**: REQ-QZA-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Quiz exists; student submits an attempt.

**Steps**:
1. Submit an attempt.
2. Retrieve the attempt via `GET /api/quizzes/attempts/{attemptId}`.
3. Inspect `answers[*].questionTextSnapshot` and `answers[*].selectedOptionTextSnapshot`.

**Expected Result**: `questionTextSnapshot` matches the question text at time of submission; `selectedOptionTextSnapshot` matches the chosen option text at time of submission. Values are stored regardless of future changes to the quiz.

---

## TC-QZA-007 — List attempts for quiz returns user's attempts only

**Requirement**: REQ-QZA-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: User A and User B have each submitted an attempt to the same quiz.

**Steps**:
1. Send `GET /api/quizzes/{quizId}/attempts` with User A's JWT.

**Expected Result**: HTTP `200`; only User A's attempt is returned.

---

## TC-QZA-008 — List attempts returns empty array when user has no attempts

**Requirement**: REQ-QZA-003
**Type**: Integration
**Priority**: Low

**Pre-conditions**: Authenticated user has never submitted an attempt for this quiz.

**Steps**:
1. Send `GET /api/quizzes/{quizId}/attempts`.

**Expected Result**: HTTP `200`; empty array `[]`.

---

## TC-QZA-009 — List attempts sorted by startedAt descending

**Requirement**: REQ-QZA-003
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: User has submitted 3 attempts to the quiz at different times.

**Steps**:
1. Send `GET /api/quizzes/{quizId}/attempts`.

**Expected Result**: HTTP `200`; 3 attempts returned in descending `startedAt` order (most recent first).

---

## TC-QZA-010 — Get single attempt returns full answer detail

**Requirement**: REQ-QZA-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Attempt exists and is owned by the authenticated user.

**Steps**:
1. Send `GET /api/quizzes/attempts/{attemptId}`.

**Expected Result**: HTTP `200`; `QuizAttemptResponseDto` includes `score`, `totalPoints`, `completedAt`, and `answers` array with `isCorrect`, `questionTextSnapshot`, `selectedOptionTextSnapshot` for each answer.

---

## TC-QZA-011 — Get attempt owned by another user returns 403

**Requirement**: REQ-QZA-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Attempt belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/quizzes/attempts/{attemptId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-QZA-012 — Get nonexistent attempt returns 404

**Requirement**: REQ-QZA-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: No attempt with the given ID exists.

**Steps**:
1. Send `GET /api/quizzes/attempts/{unknownId}`.

**Expected Result**: HTTP `404 Not Found`.
