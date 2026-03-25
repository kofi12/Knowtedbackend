package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record StudyAidDto(
        UUID studyAidId,
        UUID courseId,
        UUID documentId,
        short typeId,
        String type,
        String title,
        String generationStatus,
        Instant createdAt,
        Instant updatedAt
) {}