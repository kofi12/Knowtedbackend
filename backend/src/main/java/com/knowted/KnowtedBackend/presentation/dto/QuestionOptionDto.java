package com.knowted.KnowtedBackend.presentation.dto;

public record QuestionOptionDto(
        Long optionId,
        String optionText,
        boolean isCorrect,
        int orderIndex
) {}
