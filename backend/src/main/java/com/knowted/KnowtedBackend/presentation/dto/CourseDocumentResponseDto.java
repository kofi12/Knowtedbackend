package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record CourseDocumentResponseDto(
        UUID documentId,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        Instant uploadedAt,
        String presignedUrl,   // short-lived link to the file
        UUID courseId
) {}