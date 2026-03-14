package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.StudentUseCase;
import com.knowted.KnowtedBackend.domain.exception.StudentNotFoundException;
import com.knowted.KnowtedBackend.infrastructure.auth.JwtAuthenticationFilter;
import com.knowted.KnowtedBackend.infrastructure.auth.OAuth2SuccessHandler;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = StudentController.class)
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentUseCase studentUseCase;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Test
    void getAllStudents_returnsList() throws Exception {
        UUID id = UUID.randomUUID();
        List<StudentResponseDto> dtos = List.of(new StudentResponseDto(id, "u@x.com", "User"));
        when(studentUseCase.getAllStudents()).thenReturn(dtos);

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("u@x.com"));
    }

    @Test
    void getStudentById_found_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        when(studentUseCase.getStudentById(id))
                .thenReturn(new StudentResponseDto(id, "u@x.com", "User"));

        mockMvc.perform(get("/api/students/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(id.toString()))
                .andExpect(jsonPath("$.email").value("u@x.com"));
    }

    @Test
    void getStudentById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(studentUseCase.getStudentById(id)).thenThrow(new StudentNotFoundException(id));

        mockMvc.perform(get("/api/students/{id}", id))
                .andExpect(status().isNotFound());
    }
}
