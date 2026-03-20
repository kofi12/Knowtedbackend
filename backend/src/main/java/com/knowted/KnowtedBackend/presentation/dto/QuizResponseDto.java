package com.knowted.KnowtedBackend.presentation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuizResponseDto(
        UUID quizId,
        UUID courseId,
        UUID documentId,
        String title,
        String generationStatus,
        String questionType,
        Instant createdAt,
        List<QuizQuestionDto> questions
) {}
