package com.knowted.KnowtedBackend.presentation.dto;

public record DashboardSummaryDto(
        long activeCourses,
        long studyMaterials,
        long generatedAids
) {}