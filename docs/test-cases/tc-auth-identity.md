# Test Cases: Authentication & Identity

Covers requirements: REQ-AUTH-001 through REQ-AUTH-007

---

## TC-AUTH-001 — Health endpoint returns 200

**Requirement**: REQ-AUTH-001
**Type**: Integration
**Priority**: High

**Pre-conditions**: Application is running.

**Steps**:
1. Send `GET /api/health` with no authentication headers.

**Expected Result**: HTTP `200` with response body `backend is up`.

---

## TC-AUTH-002 — Unauthenticated request to protected endpoint returns 401

**Requirement**: REQ-AUTH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: Application is running.

**Steps**:
1. Send `GET /api/me` with no Authorization header and no `token` cookie.

**Expected Result**: HTTP `401 Unauthorized`.

---

## TC-AUTH-003 — Valid JWT in Authorization header is accepted

**Requirement**: REQ-AUTH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: A valid JWT exists for an existing student.

**Steps**:
1. Send `GET /api/me` with header `Authorization: Bearer {valid-jwt}`.

**Expected Result**: HTTP `200` with student profile DTO.

---

## TC-AUTH-004 — Valid JWT in cookie is accepted

**Requirement**: REQ-AUTH-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: A valid JWT exists for an existing student.

**Steps**:
1. Send `GET /api/me` with cookie `token={valid-jwt}` and no Authorization header.

**Expected Result**: HTTP `200` with student profile DTO.

---

## TC-AUTH-005 — Valid JWT as query parameter is accepted

**Requirement**: REQ-AUTH-004
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: A valid JWT exists for an existing student.

**Steps**:
1. Send `GET /api/me?token={valid-jwt}` with no Authorization header or cookie.

**Expected Result**: HTTP `200` with student profile DTO.

---

## TC-AUTH-006 — Expired JWT returns 401

**Requirement**: REQ-AUTH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: An expired JWT has been generated (past `exp` claim).

**Steps**:
1. Send `GET /api/me` with header `Authorization: Bearer {expired-jwt}`.

**Expected Result**: HTTP `401 Unauthorized`.

---

## TC-AUTH-007 — Tampered JWT signature returns 401

**Requirement**: REQ-AUTH-002
**Type**: Integration
**Priority**: High

**Pre-conditions**: A valid JWT exists.

**Steps**:
1. Modify the payload section of the JWT without re-signing.
2. Send `GET /api/me` with the tampered token.

**Expected Result**: HTTP `401 Unauthorized`.

---

## TC-AUTH-008 — Google OAuth2 login creates new student record

**Requirement**: REQ-AUTH-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: No student exists with the Google subject ID being tested.

**Steps**:
1. Simulate a Google OAuth2 callback with a new `sub`, `email`, and `name`.
2. `OAuth2SuccessHandler.onAuthenticationSuccess()` is triggered.

**Expected Result**: A new `Student` record is created in the database; a valid JWT is generated; response redirects to `{frontend-url}?token={jwt}`.

---

## TC-AUTH-009 — Google OAuth2 login returns existing student for known sub

**Requirement**: REQ-AUTH-003
**Type**: Integration
**Priority**: High

**Pre-conditions**: A student already exists with `providerUserId = {googleSub}`.

**Steps**:
1. Simulate a Google OAuth2 callback with the same `sub`.

**Expected Result**: No duplicate student is created; the existing student's `studentId` is encoded in the issued JWT.

---

## TC-AUTH-010 — Logout clears the token cookie

**Requirement**: REQ-AUTH-005
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: A browser session has a `token` cookie.

**Steps**:
1. Send `POST /api/auth/logout`.

**Expected Result**: HTTP `204`; response contains `Set-Cookie: token=; Max-Age=0; HttpOnly; Secure; SameSite=Lax`.

---

## TC-AUTH-011 — GET /api/me returns correct student profile

**Requirement**: REQ-AUTH-006
**Type**: Integration
**Priority**: High

**Pre-conditions**: Student exists with `studentId`, `email`, `displayName`; valid JWT encodes the `studentId`.

**Steps**:
1. Send `GET /api/me` with a valid Bearer token.

**Expected Result**: HTTP `200`; response body contains `{ studentId, email, displayName }` matching the stored student.

---

## TC-AUTH-012 — GET /api/me with non-UUID JWT subject returns 400

**Requirement**: REQ-AUTH-007
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: A JWT is crafted with `sub = "not-a-uuid"`.

**Steps**:
1. Send `GET /api/me` with the malformed-subject JWT.

**Expected Result**: HTTP `400 Bad Request`.

---

## TC-AUTH-013 — GET /api/me for deleted student returns 404

**Requirement**: REQ-AUTH-006
**Type**: Integration
**Priority**: Medium

**Pre-conditions**: JWT encodes a `studentId` for a student that no longer exists in the DB.

**Steps**:
1. Send `GET /api/me` with a valid JWT whose subject UUID does not match any student.

**Expected Result**: HTTP `404 Not Found`.
