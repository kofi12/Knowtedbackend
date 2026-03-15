package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FlashcardDeckDto(
        UUID deckId,
        String title,
        Instant createdAt,
        Instant updatedAt,
        List<FlashcardDto> flashcards
) {}
