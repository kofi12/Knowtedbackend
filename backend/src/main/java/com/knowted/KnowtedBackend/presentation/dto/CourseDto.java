package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record CourseDto(
        UUID courseId,
        UUID userId,
        String code,
        String name,
        String term,
        Instant createdAt,
        Instant updatedAt,
        long materialCount
) {}