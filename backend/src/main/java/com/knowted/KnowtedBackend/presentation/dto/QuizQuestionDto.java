package com.knowted.KnowtedBackend.presentation.dto;

import java.util.List;

public record QuizQuestionDto(
        Long questionId,
        String questionText,
        String questionType,
        int orderIndex,
        List<QuestionOptionDto> options
) {}
