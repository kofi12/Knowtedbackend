package com.knowted.KnowtedBackend.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuizAttemptResponseDto(
        Long attemptId,
        UUID quizId,
        Instant startedAt,
        Instant completedAt,
        BigDecimal score,
        Integer totalPoints,
        List<AttemptAnswerDto> answers
) {}
