package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.DashboardUseCase;
import com.knowted.KnowtedBackend.infrastructure.auth.JwtAuthenticationFilter;
import com.knowted.KnowtedBackend.infrastructure.auth.OAuth2SuccessHandler;
import com.knowted.KnowtedBackend.presentation.dto.DashboardRecentDto;
import com.knowted.KnowtedBackend.presentation.dto.DashboardSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DashboardController.class)
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class DashboardControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private DashboardUseCase dashboardUseCase;

        @MockitoBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @MockitoBean
        private OAuth2SuccessHandler oAuth2SuccessHandler;

        private final UUID userId = UUID.randomUUID();

        @Test
        void summary_returnsDto() throws Exception {
                when(dashboardUseCase.getSummary(userId))
                                .thenReturn(new DashboardSummaryDto(3, 10, 5));

                mockMvc.perform(get("/api/dashboard/summary").param("userId", userId.toString()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.activeCourses").value(3))
                                .andExpect(jsonPath("$.studyMaterials").value(10))
                                .andExpect(jsonPath("$.generatedAids").value(5));
        }

        @Test
        void recent_returnsDto() throws Exception {
                when(dashboardUseCase.getRecent(userId, null, 5))
                                .thenReturn(new DashboardRecentDto(List.of(), List.of()));

                mockMvc.perform(get("/api/dashboard/recent")
                                .param("userId", userId.toString())
                                .param("limit", "5"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.recentDocuments").isArray())
                                .andExpect(jsonPath("$.recentStudyAids").isArray());
        }

        @Test
        void recent_withCourseId_passesToUseCase() throws Exception {
                UUID courseId = UUID.randomUUID();
                when(dashboardUseCase.getRecent(userId, courseId, 10))
                                .thenReturn(new DashboardRecentDto(List.of(), List.of()));

                mockMvc.perform(get("/api/dashboard/recent")
                                .param("userId", userId.toString())
                                .param("courseId", courseId.toString())
                                .param("limit", "10"))
                                .andExpect(status().isOk());
        }
}
