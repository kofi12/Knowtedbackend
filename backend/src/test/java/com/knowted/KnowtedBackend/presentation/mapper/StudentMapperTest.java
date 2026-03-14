package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudentMapperTest {

    private StudentMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new StudentMapper();
    }

    @Test
    void toResponseDto_mapsAllFields() {
        Student student = Student.createFromGoogle("sub", "user@example.com", "Test User");
        UUID id = UUID.randomUUID();
        org.springframework.test.util.ReflectionTestUtils.setField(student, "studentId", id);

        StudentResponseDto dto = mapper.toResponseDto(student);

        assertThat(dto.getStudentId()).isEqualTo(id);
        assertThat(dto.getEmail()).isEqualTo("user@example.com");
        assertThat(dto.getDisplayName()).isEqualTo("Test User");
    }
}
