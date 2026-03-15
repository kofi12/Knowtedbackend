package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.FlashcardGenerationUseCase;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckDto;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckSummaryDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Flashcard generation endpoints.
 *
 * All routes are under /api/flashcards and require a valid JWT
 * (enforced by SecurityConfig + JwtAuthenticationFilter).
 *
 * The authenticated user's UUID is extracted from the JWT subject
 * via Spring's Authentication principal.
 */
@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardGenerationUseCase flashcardGenerationUseCase;

    public FlashcardController(FlashcardGenerationUseCase flashcardGenerationUseCase) {
        this.flashcardGenerationUseCase = flashcardGenerationUseCase;
    }

    // ------------------------------------------------------------------
    // POST /api/flashcards/generate/upload
    //
    // Accepts a multipart PDF or text file.
    // Returns the newly created deck (with all 10 cards).
    // ------------------------------------------------------------------
    @PostMapping(value = "/generate/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FlashcardDeckDto> generateFromUpload(
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {

        UUID userId = resolveUserId(authentication);
        FlashcardDeckDto deck = flashcardGenerationUseCase.generateFromUpload(userId, file);
        return ResponseEntity.ok(deck);
    }

    // ------------------------------------------------------------------
    // GET /api/flashcards
    //
    // Returns summary list of all decks belonging to the authenticated user.
    // ------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<FlashcardDeckSummaryDto>> listDecks(Authentication authentication) {
        UUID userId = resolveUserId(authentication);
        return ResponseEntity.ok(flashcardGenerationUseCase.listDecksForUser(userId));
    }

    // ------------------------------------------------------------------
    // GET /api/flashcards/{deckId}
    //
    // Returns a single deck with all its flashcards.
    // ------------------------------------------------------------------
    @GetMapping("/{deckId}")
    public ResponseEntity<FlashcardDeckDto> getDeck(
            @PathVariable UUID deckId,
            Authentication authentication) {

        UUID userId = resolveUserId(authentication);
        return ResponseEntity.ok(flashcardGenerationUseCase.getDeck(userId, deckId));
    }

    // ------------------------------------------------------------------
    // DELETE /api/flashcards/{deckId}
    //
    // Soft-deletes a deck (sets deleted_at).
    // ------------------------------------------------------------------
    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(
            @PathVariable UUID deckId,
            Authentication authentication) {

        UUID userId = resolveUserId(authentication);
        flashcardGenerationUseCase.deleteDeck(userId, deckId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    /**
     * The JWT subject is stored as the user_id UUID string by JwtUtil.
     * We parse it back to UUID here.
     */
    private UUID resolveUserId(Authentication authentication) {
        String subject = authentication.getName();
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("JWT subject is not a valid UUID: " + subject);
        }
    }
}
