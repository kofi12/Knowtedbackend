# Test Cases: Flashcards

Covers requirements: REQ-FL-001 through REQ-FL-006

---

## TC-FL-001 — Generate flashcard deck from uploaded file returns 201 with 10 cards

**Requirement**: REQ-FL-001, REQ-FL-002
**Type**: Integration (requires OpenAI or stub)
**Priority**: High

**Pre-conditions**: Authenticated user owns the course; OpenAI API is available or stubbed.

**Steps**:
1. Send `POST /api/courses/{courseId}/flashcards/generate` with `multipart/form-data`; include a PDF file in the `file` part.

**Expected Result**: HTTP `201 Created`; response body is a `FlashcardDeckResponseDto` with:
- `deckId` (UUID)
- `courseId` matching the path param
- `generationStatus = "DONE"`
- `flashcards` array with exactly 10 items
- Each flashcard has non-empty `frontText` and `backText`

---

## TC-FL-002 — Generate flashcard deck from existing documentId

**Requirement**: REQ-FL-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document already uploaded for this course; `documentId` is known.

**Steps**:
1. Send `POST /api/courses/{courseId}/flashcards/generate` with form field `documentId = {documentId}` (no file upload).

**Expected Result**: HTTP `201`; deck is generated from the existing document's stored file.

---

## TC-FL-003 — Generate flashcard deck with custom title

**Requirement**: REQ-FL-001
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course; valid document or file provided.

**Steps**:
1. Send `POST /api/courses/{courseId}/flashcards/generate` with form field `title = "Week 3 Review"` and a valid file.

**Expected Result**: HTTP `201`; `FlashcardDeckResponseDto.title = "Week 3 Review"`.

---

## TC-FL-004 — Text capped at 15,000 characters before OpenAI submission

**Requirement**: REQ-FL-002
**Type**: Unit
**Priority**: Medium

**Pre-conditions**: `FlashcardUseCase` is under test; a document with text longer than 15,000 characters.

**Steps**:
1. Call `FlashcardUseCase.generateFlashcards()` with a document whose Tika-extracted text is 20,000 characters.
2. Capture the OpenAI request payload.

**Expected Result**: The `user` message content sent to OpenAI is truncated to 15,000 characters.

---

## TC-FL-005 — Unsupported file type during generation returns error

**Requirement**: REQ-FL-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/flashcards/generate` with an `.exe` file.

**Expected Result**: HTTP `400 Bad Request`; no `StudyAid` record created.

---

## TC-FL-006 — OpenAI failure marks StudyAid as FAILED

**Requirement**: REQ-FL-003
**Type**: Unit / Integration (with stubbed OpenAI error)
**Priority**: High

**Pre-conditions**: OpenAI is stubbed to return an error.

**Steps**:
1. Call `FlashcardUseCase.generateFlashcards()`.

**Expected Result**: A `StudyAid` record is persisted with `generationStatus = "FAILED"`; an exception propagates to the caller resulting in `500` (or appropriate error response).

---

## TC-FL-007 — List flashcard decks for course returns all decks

**Requirement**: REQ-FL-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course has 2 flashcard decks generated; authenticated user owns the course.

**Steps**:
1. Send `GET /api/courses/{courseId}/flashcards`.

**Expected Result**: HTTP `200`; array of 2 `FlashcardDeckResponseDto` objects, each with a populated `flashcards` array.

---

## TC-FL-008 — List flashcard decks returns empty array for course with none

**Requirement**: REQ-FL-004
**Type**: Integration
**Priority**: Low

**Pre-conditions**: Course has no flashcard decks.

**Steps**:
1. Send `GET /api/courses/{courseId}/flashcards`.

**Expected Result**: HTTP `200`; empty array `[]`.

---

## TC-FL-009 — List flashcard decks for course owned by another user returns 403

**Requirement**: REQ-FL-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/courses/{courseId}/flashcards` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-FL-010 — Get flashcard deck by ID returns deck with all cards

**Requirement**: REQ-FL-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Flashcard deck exists and is owned by the authenticated user.

**Steps**:
1. Send `GET /api/flashcards/decks/{deckId}`.

**Expected Result**: HTTP `200`; `FlashcardDeckResponseDto` with 10 `FlashcardResponseDto` items, each having `flashcardId`, `frontText`, `backText`, `orderIndex`.

---

## TC-FL-011 — Get flashcard deck owned by another user returns 403

**Requirement**: REQ-FL-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Deck belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/flashcards/decks/{deckId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-FL-012 — Get nonexistent flashcard deck returns 404

**Requirement**: REQ-FL-005
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: No deck with the given ID exists.

**Steps**:
1. Send `GET /api/flashcards/decks/{unknownId}`.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-FL-013 — Delete flashcard deck removes StudyAid, FlashcardDeck, and Flashcards

**Requirement**: REQ-FL-006
**Type**: Integration
**Priority**: High

**Pre-conditions**: Flashcard deck exists; authenticated user owns it.

**Steps**:
1. Send `DELETE /api/flashcards/decks/{deckId}`.
2. Verify `study_aids` table: no record with `study_aid_id = {deckId}`.
3. Verify `flashcard_decks` table: no record with `deck_id = {deckId}`.
4. Verify `flashcards` table: no records referencing the deleted deck.

**Expected Result**: HTTP `204`; all cascade-deleted records are gone from DB.

---

## TC-FL-014 — Delete flashcard deck owned by another user returns 403

**Requirement**: REQ-FL-006
**Type**: Integration
**Priority**: High

**Pre-conditions**: Deck belongs to User A; JWT is for User B.

**Steps**:
1. Send `DELETE /api/flashcards/decks/{deckId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`; deck record remains.

---

## TC-FL-015 — Flashcard orderIndex is sequential and 0-based

**Requirement**: REQ-FL-001
**Type**: Unit
**Priority**: Low

**Pre-conditions**: A flashcard deck has been generated and saved.

**Steps**:
1. Retrieve the deck via `GET /api/flashcards/decks/{deckId}`.
2. Inspect `orderIndex` of each flashcard.

**Expected Result**: `orderIndex` values are 0, 1, 2, … 9 in the returned order.
