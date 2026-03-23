package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentBankItemDto(
        UUID documentId,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        Instant uploadedAt,
        UUID courseId,
        String courseName
) {}
