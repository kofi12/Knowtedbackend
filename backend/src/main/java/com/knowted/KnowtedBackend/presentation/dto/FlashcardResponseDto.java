package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;

public record FlashcardResponseDto(
        Long flashcardId,
        String frontText,
        String backText,
        int orderIndex,
        Instant createdAt
) {}
