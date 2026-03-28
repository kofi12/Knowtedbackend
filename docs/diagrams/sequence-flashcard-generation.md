# Sequence Diagram - Flashcard Deck Generation

```mermaid
sequenceDiagram
    actor Client
    participant FC as FlashcardController
    participant FU as FlashcardUseCase
    participant DocRepo as JPACourseDocumentRepository
    participant SARepo as JPAStudyAidRepository
    participant DeckRepo as JPAFlashcardDeckRepository
    participant GCS as GCSStorageService
    participant Tika as Apache Tika
    participant OpenAI as OpenAI Chat API

    Client->>+FC: POST /api/courses/{courseId}/flashcards/generate\n(multipart: file? | documentId?, title?)
    FC->>+FU: generateFlashcards(userId, courseId, file, documentId, title)

    alt file uploaded directly
        FU->>Tika: parseToString(file.getBytes())
        Tika-->>FU: extractedText
    else documentId provided
        FU->>+DocRepo: findById(documentId)
        DocRepo-->>-FU: CourseDocument
        FU->>+GCS: download(storageKey)
        GCS-->>-FU: byte[]
        FU->>Tika: parseToString(bytes)
        Tika-->>FU: extractedText
    end

    FU->>FU: cap text at 15,000 chars

    FU->>+SARepo: save(StudyAid{status=PENDING, typeId=1})
    SARepo-->>-FU: StudyAid (studyAidId)

    FU->>+DeckRepo: save(FlashcardDeck{deckId=studyAidId})
    DeckRepo-->>-FU: FlashcardDeck

    FU->>+OpenAI: POST /chat/completions\n{model, systemPrompt, userPrompt+text}
    OpenAI-->>-FU: JSON array of 10 {front, back} objects

    FU->>FU: parse JSON, build Flashcard entities (orderIndex 0–9)
    FU->>DeckRepo: save(FlashcardDeck with 10 Flashcards)

    FU->>SARepo: update(studyAidId, status=DONE)
    FU-->>-FC: FlashcardDeckResponseDto

    FC-->>Client: 201 Created\nFlashcardDeckResponseDto

    note over FU,OpenAI: On any exception: StudyAid.status = FAILED,\nexception propagates → 500 response
```

## Notes

- Text is extracted via Apache Tika regardless of whether a file is uploaded directly or retrieved from GCS via `documentId`.
- The 15,000-character cap prevents token limit errors on OpenAI's side.
- `StudyAid` and `FlashcardDeck` are created **before** the OpenAI call so that a FAILED status can be persisted if generation errors.
- The entire operation is `@Transactional` — if saving flashcards fails after OpenAI returns, the StudyAid record is rolled back.
- There is no retry or background queue; the caller blocks until generation completes or fails.
