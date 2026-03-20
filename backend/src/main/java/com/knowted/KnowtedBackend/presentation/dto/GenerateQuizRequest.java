package com.knowted.KnowtedBackend.presentation.dto;

import java.util.UUID;

public record GenerateQuizRequest(
        UUID documentId,
        String questionType,
        String title
) {}
