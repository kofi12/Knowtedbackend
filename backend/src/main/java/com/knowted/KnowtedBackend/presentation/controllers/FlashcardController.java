package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.FlashcardUseCase;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardUseCase flashcardUseCase;

    // POST /api/courses/{courseId}/flashcards/generate
    // user can either upload a file OR pass a documentId from their document bank
    @Operation(summary = "Generate flashcards", description = "Generate 10 flashcards from an uploaded document or existing document in the bank")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Flashcards generated successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request - no file or documentId provided"),
            @ApiResponse(responseCode = "404", description = "Course or document not found")
    })
    @PostMapping(value = "/courses/{courseId}/flashcards/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardDeckResponseDto generateFlashcards(
            @PathVariable UUID courseId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "documentId", required = false) UUID documentId,
            @RequestParam(value = "title", required = false) String title,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return flashcardUseCase.generateFlashcards(userId, courseId, file, documentId, title);
    }

    // GET /api/courses/{courseId}/flashcards
    // list all flashcard decks in a course
    @Operation(summary = "List flashcard decks", description = "Returns all flashcard decks for a given course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Decks retrieved"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping("/courses/{courseId}/flashcards")
    public List<FlashcardDeckResponseDto> listDecks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return flashcardUseCase.listDecks(userId, courseId);
    }

    // GET /api/flashcards/decks/{deckId}
    // get a specific deck with all its flashcards
    @Operation(summary = "Get flashcard deck", description = "Returns a deck and all its flashcards")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Deck retrieved"),
            @ApiResponse(responseCode = "404", description = "Deck not found"),
            @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @GetMapping("/flashcards/decks/{deckId}")
    public FlashcardDeckResponseDto getDeck(
            @PathVariable UUID deckId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return flashcardUseCase.getDeck(userId, deckId);
    }

    // DELETE /api/flashcards/decks/{deckId}
    // delete a flashcard deck
    @Operation(summary = "Delete flashcard deck", description = "Deletes a flashcard deck and all its cards")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Deck deleted"),
            @ApiResponse(responseCode = "404", description = "Deck not found"),
            @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @DeleteMapping("/flashcards/decks/{deckId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeck(
            @PathVariable UUID deckId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        flashcardUseCase.deleteDeck(userId, deckId);
    }
}
