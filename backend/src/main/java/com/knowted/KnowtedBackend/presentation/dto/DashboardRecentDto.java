package com.knowted.KnowtedBackend.presentation.dto;

import java.util.List;

public record DashboardRecentDto(
        List<DocumentDto> recentDocuments,
        List<StudyAidDto> recentStudyAids
) {}