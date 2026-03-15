package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record FlashcardDto(
        UUID flashcardId,
        String questionText,
        String answerText,
        int displayOrder,
        Instant createdAt
) {}
