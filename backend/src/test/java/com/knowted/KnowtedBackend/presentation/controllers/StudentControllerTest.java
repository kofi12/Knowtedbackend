package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import com.knowted.KnowtedBackend.presentation.mapper.StudentMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentRepository studentRepository;

    @MockitoBean
    private StudentMapper studentMapper;

    @Test
    void getCurrentStudent_found_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        Student student = Student.createFromGoogle("sub", "user@example.com", "Test User");
        org.springframework.test.util.ReflectionTestUtils.setField(student, "studentId", id);
        StudentResponseDto dto = new StudentResponseDto(id, "user@example.com", "Test User");

        when(studentRepository.findById(id)).thenReturn(Optional.of(student));
        when(studentMapper.toResponseDto(student)).thenReturn(dto);

        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt.subject(id.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.displayName").value("Test User"));
    }

    @Test
    void getCurrentStudent_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(studentRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt.subject(id.toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCurrentStudent_invalidSubject_returns400() throws Exception {
        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt.subject("not-a-uuid"))))
                .andExpect(status().isBadRequest());
    }
}
