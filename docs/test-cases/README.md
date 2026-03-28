# Test Cases

This directory contains test case specifications for the Knowted backend. Each file maps directly to a section of the Requirements Traceability Matrix.

## Files

| File | Feature Area | Requirement IDs Covered |
|---|---|---|
| [tc-auth-identity.md](tc-auth-identity.md) | Authentication & Identity | REQ-AUTH-001 – REQ-AUTH-007 |
| [tc-courses.md](tc-courses.md) | Courses | REQ-CRS-001 – REQ-CRS-006 |
| [tc-documents.md](tc-documents.md) | Documents | REQ-DOC-001 – REQ-DOC-008 |
| [tc-flashcards.md](tc-flashcards.md) | Flashcard Generation & Management | REQ-FL-001 – REQ-FL-006 |
| [tc-quizzes.md](tc-quizzes.md) | Quizzes & Quiz Attempts | REQ-QZ-001 – REQ-QZ-006, REQ-QZA-001 – REQ-QZA-004 |
| [tc-dashboard.md](tc-dashboard.md) | Dashboard | REQ-DASH-001 – REQ-DASH-002 |

## Test Case Format

Each test case follows this structure:

```
## TC-XXX-NNN — Short description

**Requirement**: REQ-XXX-NNN
**Type**: Unit | Integration | E2E
**Priority**: High | Medium | Low

**Pre-conditions**: What must be true before the test runs.

**Steps**:
1. Action

**Expected Result**: What the system should do.
```

## Test Types

- **Unit**: Tests a single class or method in isolation; dependencies mocked.
- **Integration**: Tests multiple layers with a real database (H2) and optionally stubbed external services (OpenAI, GCS).
- **E2E**: Full system test including live external dependencies; run manually or in staging.

## Running Tests

```bash
# Run all tests
./gradlew test

# Run a specific test class
./gradlew test --tests "com.knowted.*CourseControllerTest"

# Run with coverage report
./gradlew test jacocoTestReport
```

## Notes

- Integration tests use H2 in-memory database and Spring Boot Test slice annotations.
- OpenAI-dependent tests require either a live API key in `.env` or a stubbed `RestClient` via `@MockBean`.
- GCS-dependent tests use `NoopStorageService` (set `storage.provider=noop` in test properties).
- Test names should reference the TC ID in `@DisplayName` for traceability (e.g., `@DisplayName("TC-FL-001 - Generate flashcard deck returns 201 with 10 cards")`).
