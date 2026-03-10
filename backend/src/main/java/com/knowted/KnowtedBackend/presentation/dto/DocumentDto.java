package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentDto(
        UUID documentId,
        UUID userId,
        UUID courseId,
        String originalFilename,
        String storageKey,
        String storageBucket,
        String contentType,
        Long fileSizeBytes,
        String fileHashSha256,
        String uploadStatus,
        Instant uploadedAt
) {}