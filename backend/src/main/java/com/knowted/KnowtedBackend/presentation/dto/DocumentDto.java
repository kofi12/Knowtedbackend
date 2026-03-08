package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentDto(
        UUID documentId,
        UUID userId,
        UUID courseId,
        String originalFilename,
        String s3Key,
        String contentType,
        Long fileSizeBytes,
        String uploadStatus,
        Instant uploadedAt
) {}