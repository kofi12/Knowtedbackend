package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.infrastructure.auth.JwtAuthenticationFilter;
import com.knowted.KnowtedBackend.infrastructure.auth.OAuth2SuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = HealthController.class)
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Test
    void ping_returnsBackendIsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("backend is up"));
    }
}
