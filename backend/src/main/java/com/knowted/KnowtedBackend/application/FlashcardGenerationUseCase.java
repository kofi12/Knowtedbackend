package com.knowted.KnowtedBackend.application;

import com.knowted.KnowtedBackend.domain.entity.Flashcard;
import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import com.knowted.KnowtedBackend.domain.exception.StudyAidNotFoundException;
import com.knowted.KnowtedBackend.domain.services.FlashcardRepository;
import com.knowted.KnowtedBackend.domain.services.StudyAidRepository;
import com.knowted.KnowtedBackend.infrastructure.openai.FlashcardResponseParser;
import com.knowted.KnowtedBackend.infrastructure.openai.FlashcardResponseParser.FlashcardPair;
import com.knowted.KnowtedBackend.infrastructure.openai.OpenAiClient;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckDto;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckSummaryDto;
import com.knowted.KnowtedBackend.presentation.mapper.FlashcardMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class FlashcardGenerationUseCase {

    // Maximum characters of document text we send to the AI to stay within token limits.
    // ~12,000 chars ≈ ~3,000 tokens, leaving plenty of room in the 8k context window.
    private static final int MAX_DOC_CHARS = 12_000;

    private static final String SYSTEM_PROMPT = """
            You are a study-aid generator. Given the document text provided by the user, \
            generate exactly 10 flashcards.

            Rules:
            - Each flashcard must test a distinct, meaningful concept from the document.
            - Use ONLY the format below — no numbered lists, no extra commentary.
            - Separate each card with ONE blank line.
            - Do NOT include any text before the first card or after the last card.

            Format:
            Q: <question text>
            A: <answer text>
            """;

    private final OpenAiClient openAiClient;
    private final FlashcardResponseParser parser;
    private final StudyAidRepository studyAidRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardMapper flashcardMapper;

    public FlashcardGenerationUseCase(
            OpenAiClient openAiClient,
            FlashcardResponseParser parser,
            StudyAidRepository studyAidRepository,
            FlashcardRepository flashcardRepository,
            FlashcardMapper flashcardMapper) {

        this.openAiClient        = openAiClient;
        this.parser              = parser;
        this.studyAidRepository  = studyAidRepository;
        this.flashcardRepository = flashcardRepository;
        this.flashcardMapper     = flashcardMapper;
    }

    // -------------------------------------------------------------------------
    // GENERATE — upload a file on the spot and generate a deck
    // -------------------------------------------------------------------------

    @Transactional
    public FlashcardDeckDto generateFromUpload(UUID userId, MultipartFile file) throws IOException {
        String documentText = extractText(file);
        String deckTitle    = deriveTitle(file.getOriginalFilename());
        return generateAndPersist(userId, deckTitle, documentText);
    }

    // -------------------------------------------------------------------------
    // READ — list all decks for a user / fetch one deck with cards
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<FlashcardDeckSummaryDto> listDecksForUser(UUID userId) {
        return studyAidRepository
                .findByUserIdAndTypeCodeAndDeletedAtIsNull(userId, "FLASHCARD_DECK")
                .stream()
                .map(flashcardMapper::toSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public FlashcardDeckDto getDeck(UUID userId, UUID deckId) {
        StudyAid deck = studyAidRepository
                .findByStudyAidIdAndUserIdAndDeletedAtIsNull(deckId, userId)
                .orElseThrow(() -> new StudyAidNotFoundException(deckId));
        return flashcardMapper.toDeckDto(deck);
    }

    // -------------------------------------------------------------------------
    // DELETE — soft-delete a deck
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteDeck(UUID userId, UUID deckId) {
        StudyAid deck = studyAidRepository
                .findByStudyAidIdAndUserIdAndDeletedAtIsNull(deckId, userId)
                .orElseThrow(() -> new StudyAidNotFoundException(deckId));
        deck.setDeletedAt(Instant.now());
        studyAidRepository.save(deck);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private FlashcardDeckDto generateAndPersist(UUID userId, String title, String documentText) {
        // Trim text to avoid blowing past token limits
        String truncatedText = documentText.length() > MAX_DOC_CHARS
                ? documentText.substring(0, MAX_DOC_CHARS) + "\n[... document truncated ...]"
                : documentText;

        String userMessage = "Document text:\n\n" + truncatedText;
        String rawAiResponse = openAiClient.chat(SYSTEM_PROMPT, userMessage);

        List<FlashcardPair> pairs = parser.parse(rawAiResponse);

        if (pairs.isEmpty()) {
            throw new IllegalStateException(
                "AI returned no parseable flashcards. Raw response was:\n" + rawAiResponse);
        }

        // Persist the deck
        StudyAid deck = new StudyAid(userId, "FLASHCARD_DECK", title);

        for (int i = 0; i < pairs.size(); i++) {
            FlashcardPair pair = pairs.get(i);
            Flashcard card = new Flashcard(deck, pair.question(), pair.answer(), i + 1);
            deck.addFlashcard(card);
        }

        studyAidRepository.save(deck); // cascades to flashcards

        return flashcardMapper.toDeckDto(deck);
    }

    /**
     * Extract plain text from a PDF or plain-text file.
     * Throws IllegalArgumentException for unsupported types.
     */
    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException("Cannot determine file type.");
        }

        if (contentType.equals("application/pdf")) {
            try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(file.getInputStream()))) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        }

        if (contentType.startsWith("text/")) {
            return new String(file.getBytes());
        }

        throw new IllegalArgumentException(
            "Unsupported file type: " + contentType + ". Please upload a PDF or plain text file.");
    }

    private String deriveTitle(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "Flashcard Deck";
        }
        // Strip extension
        int dot = originalFilename.lastIndexOf('.');
        String base = dot > 0 ? originalFilename.substring(0, dot) : originalFilename;
        // Replace underscores/hyphens with spaces and trim
        return base.replace('_', ' ').replace('-', ' ').trim();
    }
}
