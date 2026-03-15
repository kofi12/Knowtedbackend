package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record FlashcardDeckSummaryDto(
        UUID deckId,
        String title,
        int cardCount,
        Instant createdAt
) {}
