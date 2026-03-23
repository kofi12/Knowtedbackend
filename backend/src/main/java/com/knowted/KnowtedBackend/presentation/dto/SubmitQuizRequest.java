package com.knowted.KnowtedBackend.presentation.dto;

import java.util.List;
import java.util.Map;

public record SubmitQuizRequest(
        // Maps questionId -> list of selected optionIds
        Map<Long, List<Long>> answers
) {}
