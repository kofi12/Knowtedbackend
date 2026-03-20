package com.knowted.KnowtedBackend.presentation.dto;

public record AttemptAnswerDto(
        Long questionId,
        Long selectedOptionId,
        String questionTextSnapshot,
        String selectedOptionTextSnapshot,
        Boolean isCorrect
) {}
