package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FlashcardDeckResponseDto(
        UUID deckId,
        UUID courseId,
        UUID documentId,
        String title,
        String generationStatus,
        Instant createdAt,
        List<FlashcardResponseDto> flashcards
) {}
