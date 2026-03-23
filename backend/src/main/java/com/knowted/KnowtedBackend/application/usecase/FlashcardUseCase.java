package com.knowted.KnowtedBackend.application.usecase;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowted.KnowtedBackend.domain.entity.*;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.exception.DocumentNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.*;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardResponseDto;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("unused")
public class FlashcardUseCase {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FlashcardUseCase.class);

    private final JPACourseRepository courseRepository;
    private final JPACourseDocumentRepository documentRepository;
    private final JPAStudyAidRepository studyAidRepository;
    private final JPAFlashcardDeckRepository deckRepository;
    private final JPAFlashcardRepository flashcardRepository;
    private final StorageService storageService;
    private final GCSStorageServiceUseCase gcsStorageServiceUseCase;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Tika tika;

    private final String openaiApiKey;
    private final String openaiModel;

    // type_id = 1 corresponds to FLASHCARD_DECK in the study_aid_types table
    private static final short FLASHCARD_DECK_TYPE_ID = 1;
    private static final int FLASHCARD_COUNT = 10;
    // cap how much document text we send to openai so we dont blow up the token limit
    private static final int MAX_TEXT_LENGTH = 15000;

    public FlashcardUseCase(
            JPACourseRepository courseRepository,
            JPACourseDocumentRepository documentRepository,
            JPAStudyAidRepository studyAidRepository,
            JPAFlashcardDeckRepository deckRepository,
            JPAFlashcardRepository flashcardRepository,
            StorageService storageService,
            GCSStorageServiceUseCase gcsStorageServiceUseCase,
            @Value("${OPENAI_API_KEY}") String openaiApiKey,
            @Value("${OPENAI_MODEL:gpt-4o-mini}") String openaiModel
    ) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.studyAidRepository = studyAidRepository;
        this.deckRepository = deckRepository;
        this.flashcardRepository = flashcardRepository;
        this.storageService = storageService;
        this.gcsStorageServiceUseCase = gcsStorageServiceUseCase;
        this.openaiApiKey = openaiApiKey;
        this.openaiModel = openaiModel;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
        this.objectMapper = new ObjectMapper();
        this.tika = new Tika();
    }

    // generates 10 flashcards from either an uploaded file or an existing document in the bank
    @Transactional
    public FlashcardDeckResponseDto generateFlashcards(UUID userId, UUID courseId, MultipartFile file, UUID documentId, String userTitle) {
        Course course = courseRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId));

        String documentText;
        UUID linkedDocumentId = documentId;

        if (file != null && !file.isEmpty()) {
            // user uploaded a new file on the spot - save it to document bank first
            var uploadDto = com.knowted.KnowtedBackend.presentation.dto.UploadCourseDocumentDto.builder()
                    .courseId(courseId)
                    .file(file)
                    .studentId(userId)
                    .build();
            var savedDoc = gcsStorageServiceUseCase.execute(uploadDto);
            linkedDocumentId = savedDoc.documentId();
            documentText = extractTextFromBytes(getFileBytes(file), file.getOriginalFilename());
        } else if (documentId != null) {
            // user picked a document from their document bank
            CourseDocument doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new DocumentNotFoundException("Document not found: " + documentId));
            byte[] docBytes = storageService.download(doc.getStorageKey());
            documentText = extractTextFromBytes(docBytes, doc.getOriginalFilename());
        } else {
            throw new IllegalArgumentException("You must provide either a file upload or a documentId");
        }

        if (documentText == null || documentText.isBlank()) {
            throw new IllegalArgumentException("Could not extract any text from the document");
        }

        // trim to max length so we dont exceed openai token limits
        if (documentText.length() > MAX_TEXT_LENGTH) {
            documentText = documentText.substring(0, MAX_TEXT_LENGTH);
        }

        // create the study aid record first with PENDING status
        String title = (userTitle != null && !userTitle.isBlank())
                ? userTitle.trim() + " - " + course.getName()
                : "Flashcards - " + course.getName();
        StudyAid studyAid = StudyAid.create(userId, course, linkedDocumentId, FLASHCARD_DECK_TYPE_ID, title);
        studyAid = studyAidRepository.save(studyAid);

        // create the flashcard deck (deck_id = study_aid_id per the schema)
        FlashcardDeck deck = new FlashcardDeck(studyAid.getStudyAidId());
        deck = deckRepository.save(deck);

        // call openai to generate the flashcards
        List<Map<String, String>> generatedCards;
        try {
            generatedCards = callOpenAI(documentText);
        } catch (Exception e) {
            log.error("OpenAI flashcard generation failed for studyAidId={}", studyAid.getStudyAidId(), e);
            studyAid.setGenerationStatus("FAILED");
            studyAidRepository.save(studyAid);
            throw new RuntimeException("Failed to generate flashcards: " + e.getMessage(), e);
        }

        // save each flashcard to the deck
        for (int i = 0; i < generatedCards.size(); i++) {
            Map<String, String> card = generatedCards.get(i);
            Flashcard flashcard = new Flashcard(
                    card.get("front"),
                    card.get("back"),
                    i
            );
            deck.addFlashcard(flashcard);
        }
        deck = deckRepository.save(deck);

        // mark generation as done
        studyAid.setGenerationStatus("DONE");
        studyAidRepository.save(studyAid);

        return buildResponseDto(studyAid, deck);
    }

    // get a specific flashcard deck with all its cards
    @Transactional(readOnly = true)
    public FlashcardDeckResponseDto getDeck(UUID userId, UUID deckId) {
        FlashcardDeck deck = deckRepository.findByIdWithFlashcards(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard deck not found: " + deckId));

        StudyAid studyAid = studyAidRepository.findByIdWithCourse(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Study aid not found for deck: " + deckId));

        // make sure this deck belongs to the requesting user
        if (!studyAid.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("You don't have access to this deck");
        }

        return buildResponseDto(studyAid, deck);
    }

    // list all flashcard decks in a course
    @Transactional(readOnly = true)
    public List<FlashcardDeckResponseDto> listDecks(UUID userId, UUID courseId) {
        Course course = courseRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId));

        // get all study aids of type FLASHCARD_DECK for this course, eagerly fetching course
        List<StudyAid> studyAids = studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, FLASHCARD_DECK_TYPE_ID);

        return studyAids.stream().map(aid -> {
            FlashcardDeck deck = deckRepository.findByIdWithFlashcards(aid.getStudyAidId()).orElse(null);
            if (deck == null) return null;
            return buildResponseDto(aid, deck);
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    // delete a flashcard deck and its parent study aid
    @Transactional
    public void deleteDeck(UUID userId, UUID deckId) {
        StudyAid studyAid = studyAidRepository.findById(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard deck not found: " + deckId));

        if (!studyAid.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("You don't have access to this deck");
        }

        // cascade delete handles flashcard_decks -> flashcards
        // and study_aids -> flashcard_decks via the FK cascade in the schema
        deckRepository.deleteById(deckId);
        studyAidRepository.deleteById(deckId);
    }

    // uses apache tika to extract text from document bytes regardless of file type
    private String extractTextFromBytes(byte[] bytes, String filename) {
        try (InputStream is = new ByteArrayInputStream(bytes)) {
            return tika.parseToString(is);
        } catch (Exception e) {
            log.warn("Tika text extraction failed for file={}", filename, e);
            // fallback: try reading as plain text
            return new String(bytes);
        }
    }

    private byte[] getFileBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }
    }

    // calls openai chat completions api to generate flashcards from document text
    private List<Map<String, String>> callOpenAI(String documentText) {
        String prompt = "You are a study aid generator. Based on the following document text, generate exactly "
                + FLASHCARD_COUNT + " flashcards. Each flashcard should have a concise question or term on the front "
                + "and a clear answer or definition on the back. Return ONLY a JSON array with objects containing "
                + "\"front\" and \"back\" keys. No markdown, no explanation, just the JSON array.\n\n"
                + "Document text:\n" + documentText;

        // build the request body for openai chat completions
        Map<String, Object> requestBody = Map.of(
                "model", openaiModel,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a helpful study assistant that creates flashcards."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 2000
        );

        String responseBody = restClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return parseOpenAIResponse(responseBody);
    }

    // parses the openai response to extract the flashcard json array
    private List<Map<String, String>> parseOpenAIResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // openai sometimes wraps json in markdown code blocks, strip those
            content = content.trim();
            if (content.startsWith("```json")) {
                content = content.substring(7);
            } else if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            content = content.trim();

            List<Map<String, String>> cards = objectMapper.readValue(
                    content, new TypeReference<List<Map<String, String>>>() {}
            );

            // safety check: only return up to FLASHCARD_COUNT cards
            if (cards.size() > FLASHCARD_COUNT) {
                cards = cards.subList(0, FLASHCARD_COUNT);
            }

            // validate each card has front and back
            for (Map<String, String> card : cards) {
                if (!card.containsKey("front") || !card.containsKey("back")) {
                    throw new RuntimeException("OpenAI returned a card missing 'front' or 'back' field");
                }
            }

            return cards;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response: " + e.getMessage(), e);
        }
    }

    private FlashcardDeckResponseDto buildResponseDto(StudyAid studyAid, FlashcardDeck deck) {
        List<FlashcardResponseDto> cardDtos = deck.getFlashcards().stream()
                .map(card -> new FlashcardResponseDto(
                        card.getFlashcardId(),
                        card.getFrontText(),
                        card.getBackText(),
                        card.getOrderIndex(),
                        card.getCreatedAt()
                ))
                .collect(Collectors.toList());

        UUID courseId = studyAid.getCourse() != null ? studyAid.getCourse().getCourseId() : null;

        return new FlashcardDeckResponseDto(
                deck.getDeckId(),
                courseId,
                studyAid.getDocumentId(),
                studyAid.getTitle(),
                studyAid.getGenerationStatus(),
                studyAid.getCreatedAt(),
                cardDtos
        );
    }
}
