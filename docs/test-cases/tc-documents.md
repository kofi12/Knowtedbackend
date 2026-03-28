# Test Cases: Documents

Covers requirements: REQ-DOC-001 through REQ-DOC-008

---

## TC-DOC-001 — Upload valid PDF returns 201 with metadata and presigned URL

**Requirement**: REQ-DOC-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user has an existing course; GCS (or noop) storage is configured.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with `Content-Type: multipart/form-data` and a PDF file part named `file`.

**Expected Result**: HTTP `201 Created`; response contains `documentId`, `originalFilename`, `contentType = "application/pdf"`, `fileSizeBytes`, `uploadedAt`, `presignedUrl` (non-empty HTTPS URL), `courseId`.

---

## TC-DOC-002 — Upload valid DOCX file is accepted

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a `.docx` file.

**Expected Result**: HTTP `201`; `contentType` reflects DOCX MIME type.

---

## TC-DOC-003 — Upload valid TXT file is accepted

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a `.txt` file.

**Expected Result**: HTTP `201`.

---

## TC-DOC-004 — Upload valid PPTX file is accepted

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a `.pptx` file.

**Expected Result**: HTTP `201`.

---

## TC-DOC-005 — Upload valid JPEG image is accepted

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a `.jpg` file.

**Expected Result**: HTTP `201`.

---

## TC-DOC-006 — Upload invalid file type returns 400

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with an `.exe` file.

**Expected Result**: HTTP `400 Bad Request`; error body indicates invalid file type.

---

## TC-DOC-007 — Upload ZIP archive returns 400

**Requirement**: REQ-DOC-002
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a `.zip` file.

**Expected Result**: HTTP `400 Bad Request`.

---

## TC-DOC-008 — Upload file exceeding 25 MB returns 413

**Requirement**: REQ-DOC-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user owns the course.

**Steps**:
1. Send `POST /api/courses/{courseId}/documents` with a file > 25 MB.

**Expected Result**: HTTP `413 Payload Too Large`.

---

## TC-DOC-009 — List course documents returns paginated results

**Requirement**: REQ-DOC-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course has 5 uploaded documents.

**Steps**:
1. Send `GET /api/courses/{courseId}/documents?page=0&size=3`.

**Expected Result**: HTTP `200`; array of 3 document DTOs, sorted by `uploadedAt` DESC.

---

## TC-DOC-010 — List course documents page 2

**Requirement**: REQ-DOC-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Course has 5 uploaded documents.

**Steps**:
1. Send `GET /api/courses/{courseId}/documents?page=1&size=3`.

**Expected Result**: HTTP `200`; array of 2 remaining document DTOs.

---

## TC-DOC-011 — List documents for course owned by another user returns 403

**Requirement**: REQ-DOC-004
**Type**: Integration
**Priority**: High

**Pre-conditions**: Course belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/courses/{courseId}/documents` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-DOC-012 — Get document metadata returns correct DTO

**Requirement**: REQ-DOC-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document exists and is owned by the authenticated user.

**Steps**:
1. Send `GET /api/documents/{documentId}`.

**Expected Result**: HTTP `200`; DTO contains `documentId`, `originalFilename`, `contentType`, `fileSizeBytes`, `uploadedAt`.

---

## TC-DOC-013 — Get document owned by another user returns 403

**Requirement**: REQ-DOC-005
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/documents/{documentId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-DOC-014 — Get nonexistent document returns 404

**Requirement**: REQ-DOC-005
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: No document with the given ID exists.

**Steps**:
1. Send `GET /api/documents/{unknownId}`.

**Expected Result**: HTTP `404 Not Found`.

---

## TC-DOC-015 — Get presigned URL returns HTTPS URL with expiry

**Requirement**: REQ-DOC-006
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document exists and is owned by the authenticated user.

**Steps**:
1. Send `GET /api/documents/{documentId}/presigned-url`.

**Expected Result**: HTTP `200`; `presignedUrl` is a non-empty HTTPS URL; `expiresAt` is approximately 1 hour in the future.

---

## TC-DOC-016 — Get presigned URL with custom expiry

**Requirement**: REQ-DOC-006
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: Document exists and is owned by the authenticated user.

**Steps**:
1. Send `GET /api/documents/{documentId}/presigned-url?expirySeconds=300`.

**Expected Result**: HTTP `200`; `expiresAt` is approximately 5 minutes in the future.

---

## TC-DOC-017 — Get presigned URL for document owned by another user returns 403

**Requirement**: REQ-DOC-006
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document belongs to User A; JWT is for User B.

**Steps**:
1. Send `GET /api/documents/{documentId}/presigned-url` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`.

---

## TC-DOC-018 — Delete document removes DB record and GCS blob

**Requirement**: REQ-DOC-007
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document exists in DB and GCS.

**Steps**:
1. Send `DELETE /api/documents/{documentId}`.
2. Send `GET /api/documents/{documentId}`.

**Expected Result**: First call returns `204`; second call returns `404`; GCS blob is removed.

---

## TC-DOC-019 — Delete document owned by another user returns 403

**Requirement**: REQ-DOC-007
**Type**: Integration
**Priority**: High

**Pre-conditions**: Document belongs to User A; JWT is for User B.

**Steps**:
1. Send `DELETE /api/documents/{documentId}` with User B's JWT.

**Expected Result**: HTTP `403 Forbidden`; document record remains in DB.

---

## TC-DOC-020 — Document bank returns all user documents across courses

**Requirement**: REQ-DOC-008
**Type**: Integration
**Priority**: High

**Pre-conditions**: Authenticated user has 3 documents across 2 different courses.

**Steps**:
1. Send `GET /api/documents`.

**Expected Result**: HTTP `200`; array of 3 `DocumentBankItemDto` objects including `documentId`, `originalFilename`, `courseId`, `courseName`, sorted by `uploadedAt` DESC.

---

## TC-DOC-021 — Document bank with filename search filter

**Requirement**: REQ-DOC-008
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: User has documents: "lecture1.pdf", "notes.docx", "lecture2.pdf".

**Steps**:
1. Send `GET /api/documents?search=lecture`.

**Expected Result**: HTTP `200`; array contains only "lecture1.pdf" and "lecture2.pdf".

---

## TC-DOC-022 — Document bank with courseId filter

**Requirement**: REQ-DOC-008
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: User has 2 documents in Course A and 1 in Course B.

**Steps**:
1. Send `GET /api/documents?courseId={courseA-id}`.

**Expected Result**: HTTP `200`; array contains only the 2 documents from Course A.

---

## TC-DOC-023 — Document bank returns empty for user with no documents

**Requirement**: REQ-DOC-008
**Type**: Integration
**Priority**: Low

**Pre-conditions**: Authenticated user has no uploaded documents.

**Steps**:
1. Send `GET /api/documents`.

**Expected Result**: HTTP `200`; empty array `[]`.
