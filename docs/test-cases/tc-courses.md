# Test Cases: Courses

Covers requirements: REQ-CRS-001 through REQ-CRS-006

---

## TC-CRS-001 — List courses returns all courses for user

**Requirement**: REQ-CRS-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Student A has 3 courses; Student B has 1 course.

**Steps**:
1. Send `GET /api/courses?userId={studentA-id}` with a valid JWT.

**Expected Result**: HTTP `200`; array of 3 course DTOs, each containing `courseId`, `name`, `code`, `term`, `materialCount`; Student B's course is not included.

---

## TC-CRS-002 — List courses returns empty array when user has no courses

**Requirement**: REQ-CRS-001
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: The specified user has no courses.

**Steps**:
1. Send `GET /api/courses?userId={userId}` with a valid JWT.

**Expected Result**: HTTP `200`; empty JSON array `[]`.

---

## TC-CRS-003 — Create course with all fields returns course DTO

**Requirement**: REQ-CRS-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user exists.

**Steps**:
1. Send `POST /api/courses?userId={userId}` with body `{ "name": "Algorithms", "code": "CS301", "term": "Fall 2025" }`.

**Expected Result**: HTTP `200`; response contains `courseId` (UUID), `name = "Algorithms"`, `code = "CS301"`, `term = "Fall 2025"`, `materialCount = 0`.

---

## TC-CRS-004 — Create course with only required field (name)

**Requirement**: REQ-CRS-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user exists.

**Steps**:
1. Send `POST /api/courses?userId={userId}` with body `{ "name": "Intro to CS" }` (no `code` or `term`).

**Expected Result**: HTTP `200`; course is created with `name = "Intro to CS"` and nullable `code`/`term`.

---

## TC-CRS-005 — Create course without name returns 400

**Requirement**: REQ-CRS-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user exists.

**Steps**:
1. Send `POST /api/courses?userId={userId}` with body `{}` (no name field).

**Expected Result**: HTTP `400 Bad Request`.

---

## TC-CRS-006 — Get course by ID returns course

**Requirement**: REQ-CRS-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course exists for the user.

**Steps**:
1. Send `GET /api/courses/{courseId}?userId={userId}` with a valid JWT.

**Expected Result**: HTTP `200`; course DTO matching the existing course is returned.

---

## TC-CRS-007 — Get course with unknown ID returns 404

**Requirement**: REQ-CRS-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: No course exists with the given ID for this user.

**Steps**:
1. Send `GET /api/courses/{unknownId}?userId={userId}` with a valid JWT.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-CRS-008 — Patch course updates only supplied fields

**Requirement**: REQ-CRS-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course exists with `name = "Old Name"`, `code = "CS100"`, `term = "Spring 2025"`.

**Steps**:
1. Send `PATCH /api/courses/{courseId}?userId={userId}` with body `{ "name": "New Name" }`.

**Expected Result**: HTTP `200`; `name = "New Name"`, `code = "CS100"` and `term = "Spring 2025"` unchanged.

---

## TC-CRS-009 — Patch course with unknown ID returns 404

**Requirement**: REQ-CRS-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Course ID does not exist.

**Steps**:
1. Send `PATCH /api/courses/{unknownId}?userId={userId}` with a valid body.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-CRS-010 — Delete course removes course record

**Requirement**: REQ-CRS-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course exists with no associated documents.

**Steps**:
1. Send `DELETE /api/courses/{courseId}?userId={userId}`.
2. Send `GET /api/courses/{courseId}?userId={userId}`.

**Expected Result**: First call returns `200`; second call returns `404`.

---

## TC-CRS-011 — Delete course cascades to documents in DB and GCS

**Requirement**: REQ-CRS-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course exists with 2 uploaded documents stored in GCS.

**Steps**:
1. Send `DELETE /api/courses/{courseId}?userId={userId}`.
2. Check `documents` table for records with `course_id = {courseId}`.
3. Verify GCS blobs are deleted (best-effort).

**Expected Result**: `200` response; no document records remain in DB for this course; GCS blobs are removed.

---

## TC-CRS-012 — Delete unknown course returns 404

**Requirement**: REQ-CRS-005
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Course ID does not exist.

**Steps**:
1. Send `DELETE /api/courses/{unknownId}?userId={userId}`.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-CRS-013 — Course enforces 50-document maximum

**Requirement**: REQ-CRS-006
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Course already has 50 documents.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a valid file.

**Expected Result**: HTTP `400` (or appropriate client error); no new document record created.
