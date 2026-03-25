package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.DashboardUseCase;
import com.knowted.KnowtedBackend.presentation.dto.DashboardRecentDto;
import com.knowted.KnowtedBackend.presentation.dto.DashboardSummaryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@SuppressWarnings("unused")
public class DashboardController {

    private final DashboardUseCase dashboardUseCase;

    public DashboardController(DashboardUseCase dashboardUseCase) {
        this.dashboardUseCase = dashboardUseCase;
    }

    @GetMapping("/api/dashboard/summary")
    public DashboardSummaryDto summary(@RequestParam UUID userId) {
        return dashboardUseCase.getSummary(userId);
    }

    @GetMapping("/api/dashboard/recent")
    public DashboardRecentDto recent(
            @RequestParam UUID userId,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return dashboardUseCase.getRecent(userId, courseId, limit);
    }
}