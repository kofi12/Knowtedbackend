# Requirements Tracking Matrix

## Scope

This matrix tracks functional requirements for backend endpoints exposed by the Knowted backend API.

## Functional Requirements


| FR ID  | Functional Requirement                                                         | Priority | Related Endpoint(s)                             | Acceptance Criteria                                                                                   |
| ------ | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FR-001 | The system shall expose a health endpoint for uptime checks.                   | High     | `GET /api/health`                               | Returns `200` with body `backend is up`.                                                              |
| FR-002 | The system shall authenticate API users with JWT bearer tokens.                | High     | All `/api/**` except `/api/health`              | Requests without valid auth receive `401`; valid tokens are accepted.                                 |
| FR-003 | The system shall return the currently authenticated student profile.           | High     | `GET /api/me`                                   | Returns `200` with `studentId`, `email`, and `displayName` for valid JWT subject.                     |
| FR-004 | The system shall reject malformed student IDs in JWT subject claims.           | Medium   | `GET /api/me`                                   | Returns `400` when JWT `sub` is not a UUID.                                                           |
| FR-005 | The system shall list all courses for a specified user.                        | High     | `GET /api/courses?userId=...`                   | Returns `200` with an array of course DTOs.                                                           |
| FR-006 | The system shall create a course for a specified user.                         | High     | `POST /api/courses?userId=...`                  | Returns `200` with created course DTO from valid request payload.                                     |
| FR-007 | The system shall retrieve a single course by ID for a specified user.          | High     | `GET /api/courses/{courseId}?userId=...`        | Returns `200` when found and accessible; `404` when not found.                                        |
| FR-008 | The system shall partially update course fields.                               | High     | `PATCH /api/courses/{courseId}?userId=...`      | Returns `200` with updated course DTO after successful patch.                                         |
| FR-009 | The system shall delete a specified course.                                    | High     | `DELETE /api/courses/{courseId}?userId=...`     | Returns successful response (`200`) when deletion is completed.                                       |
| FR-010 | The system shall return dashboard summary metrics for a user.                  | Medium   | `GET /api/dashboard/summary?userId=...`         | Returns `200` with `activeCourses`, `studyMaterials`, and `generatedAids`.                            |
| FR-011 | The system shall return recent dashboard activity with optional filters.       | Medium   | `GET /api/dashboard/recent?userId=...`          | Returns `200` with `recentDocuments` and `recentStudyAids`; supports optional `courseId` and `limit`. |
| FR-012 | The system shall list paginated documents within a course.                     | High     | `GET /api/courses/{courseId}/documents`         | Returns `200` with ordered document metadata; supports `page` and `size`.                             |
| FR-013 | The system shall upload a file as a course document to configured storage.     | High     | `POST /api/courses/{courseId}/documents`        | Accepts multipart `file`; returns `201` with document metadata and presigned URL.                     |
| FR-014 | The system shall validate uploaded document content type against an allowlist. | High     | `POST /api/courses/{courseId}/documents`        | Invalid file types are rejected with a client error response.                                         |
| FR-015 | The system shall return metadata for a specific document.                      | Medium   | `GET /api/documents/{documentId}`               | Returns `200` with document metadata when document exists and access is allowed.                      |
| FR-016 | The system shall generate temporary signed URLs for document access.           | High     | `GET /api/documents/{documentId}/presigned-url` | Returns `200` with URL and expiry metadata.                                                           |
| FR-017 | The system shall delete a document record and storage object.                  | High     | `DELETE /api/documents/{documentId}`            | Returns `204`; file is removed from storage in best effort mode and metadata is deleted.              |
| FR-018 | The system shall support Google OAuth2 login flow.                             | High     | `/oauth2/**`, `/login/oauth2/code/**`           | Successful login creates/updates student and issues JWT for frontend session flow.                    |


## Endpoint Tracking Matrix


| Req ID  | Endpoint                                    | Method | Purpose                 | Auth     | Success  | Typical Error Responses           | Automated Test Coverage   |
| ------- | ------------------------------------------- | ------ | ----------------------- | -------- | -------- | --------------------------------- | ------------------------- |
| API-001 | `/api/health`                               | GET    | Health check            | Public   | `200`    | n/a                               | `HealthControllerTest`    |
| API-002 | `/api/me`                                   | GET    | Current student profile | Required | `200`    | `400`, `401`, `404`               | `StudentControllerTest`   |
| API-003 | `/api/courses`                              | GET    | List courses            | Required | `200`    | `401` + domain errors             | `CourseControllerTest`    |
| API-004 | `/api/courses`                              | POST   | Create course           | Required | `200`    | `400`, `401`                      | `CourseControllerTest`    |
| API-005 | `/api/courses/{courseId}`                   | GET    | Get course              | Required | `200`    | `401`, `404`                      | `CourseControllerTest`    |
| API-006 | `/api/courses/{courseId}`                   | PATCH  | Update course           | Required | `200`    | `400`, `401`, `404`               | `CourseControllerTest`    |
| API-007 | `/api/courses/{courseId}`                   | DELETE | Delete course           | Required | `200`    | `401`, `404`                      | `CourseControllerTest`    |
| API-008 | `/api/dashboard/summary`                    | GET    | Dashboard summary       | Required | `200`    | `401`                             | `DashboardControllerTest` |
| API-009 | `/api/dashboard/recent`                     | GET    | Dashboard recent data   | Required | `200`    | `401`                             | `DashboardControllerTest` |
| API-010 | `/api/courses/{courseId}/documents`         | GET    | List course documents   | Required | `200`    | `401`, `403`, `404`               | Not found                 |
| API-011 | `/api/courses/{courseId}/documents`         | POST   | Upload document         | Required | `201`    | `400`, `401`, `403`, `404`, `500` | Not found                 |
| API-012 | `/api/documents/{documentId}`               | GET    | Get document            | Required | `200`    | `401`, `403`, `404`               | Not found                 |
| API-013 | `/api/documents/{documentId}/presigned-url` | GET    | Get signed URL          | Required | `200`    | `401`, `403`, `404`               | Not found                 |
| API-014 | `/api/documents/{documentId}`               | DELETE | Delete document         | Required | `204`    | `401`, `403`, `404`               | Not found                 |
| API-015 | `/oauth2/authorization/google`              | GET    | Start OAuth             | Public   | Redirect | OAuth errors                      | Not found                 |
| API-016 | `/login/oauth2/code/google`                 | GET    | OAuth callback          | Public   | Redirect | OAuth errors                      | Not found                 |


## Notes

- Security policy currently requires authentication for `/api/**` except `/api/health`.
- Course and dashboard endpoints currently take `userId` as query input rather than deriving user from JWT subject.
- Document endpoints derive user identity from JWT subject.

