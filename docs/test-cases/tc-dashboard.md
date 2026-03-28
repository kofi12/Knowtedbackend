# Test Cases: Dashboard

Covers requirements: REQ-DASH-001, REQ-DASH-002

---

## TC-DASH-001 — Summary returns correct aggregated counts

**Requirement**: REQ-DASH-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user has 3 courses, 7 documents, and 4 study aids (2 flashcard decks + 2 quizzes).

**Steps**:
1. Send `GET /api/dashboard/summary?userId={userId}`.

**Expected Result**: HTTP `200`; `{ activeCourses: 3, studyMaterials: 7, generatedAids: 4 }`.

---

## TC-DASH-002 — Summary returns zeros for new user with no data

**Requirement**: REQ-DASH-001
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user has no courses, documents, or study aids.

**Steps**:
1. Send `GET /api/dashboard/summary?userId={userId}`.

**Expected Result**: HTTP `200`; `{ activeCourses: 0, studyMaterials: 0, generatedAids: 0 }`.

---

## TC-DASH-003 — Summary requires authentication

**Requirement**: REQ-DASH-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: No auth token provided.

**Steps**:
1. Send `GET /api/dashboard/summary?userId={userId}` with no JWT.

**Expected Result**: HTTP `401 Unauthorized`.

---

## TC-DASH-004 — Recent activity returns latest documents and study aids

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: User has 5 documents and 5 study aids; default limit is 5.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userId}`.

**Expected Result**: HTTP `200`; `recentDocuments` contains up to 5 items sorted by `uploadedAt` DESC; `recentStudyAids` contains up to 5 items sorted by `updatedAt` DESC.

---

## TC-DASH-005 — Recent activity respects custom limit

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: User has 10 documents and 10 study aids.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userId}&limit=3`.

**Expected Result**: HTTP `200`; `recentDocuments` has ≤3 items; `recentStudyAids` has ≤3 items.

---

## TC-DASH-006 — Recent activity caps limit at 50

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: User has 60 documents.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userId}&limit=100`.

**Expected Result**: HTTP `200`; `recentDocuments` has at most 50 items (limit is capped at 50).

---

## TC-DASH-007 — Recent activity filtered by courseId scopes results to that course

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: User has documents and study aids in Course A and Course B.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userId}&courseId={courseA-id}`.

**Expected Result**: HTTP `200`; `recentDocuments` and `recentStudyAids` contain only items belonging to Course A.

---

## TC-DASH-008 — Recent activity with courseId owned by another user returns 403

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course belongs to User A; request is made with User B's userId.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userB-id}&courseId={courseA-id}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-DASH-009 — Recent activity returns empty arrays when user has no data

**Requirement**: REQ-DASH-002
**Type**: Integration
**Priority**: Low

**Pre-conditions**: User has no documents or study aids.

**Steps**:
1. Send `GET /api/dashboard/recent?userId={userId}`.

**Expected Result**: HTTP `200`; `{ recentDocuments: [], recentStudyAids: [] }`.

---

## TC-DASH-010 — StudyAidDto type field correctly maps typeId to string

**Requirement**: REQ-DASH-002
**Type**: Unit
**Priority**: Medium

**Pre-conditions**: `StudyAidMapper` is under test.

**Steps**:
1. Call `StudyAidMapper.toDto()` with a `StudyAid` having `typeId = 1`.
2. Call `StudyAidMapper.toDto()` with a `StudyAid` having `typeId = 2`.

**Expected Result**: `type = "FLASHCARD_DECK"` for `typeId=1`; `type = "QUIZ"` for `typeId=2`.
