package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.presentation.dto.CourseDto;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CourseMapperTest {

    @Test
    void toDto_mapsAllFields() {
        UUID courseId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Instant createdAt = Instant.now();
        Instant updatedAt = Instant.now().plusSeconds(60);
        Course course = new Course(userId, "CS101", "Intro to CS", "Fall 2024");
        org.springframework.test.util.ReflectionTestUtils.setField(course, "courseId", courseId);
        org.springframework.test.util.ReflectionTestUtils.setField(course, "createdAt", createdAt);
        org.springframework.test.util.ReflectionTestUtils.setField(course, "updatedAt", updatedAt);

        CourseDto dto = CourseMapper.toDto(course);

        assertThat(dto.courseId()).isEqualTo(courseId);
        assertThat(dto.userId()).isEqualTo(userId);
        assertThat(dto.code()).isEqualTo("CS101");
        assertThat(dto.name()).isEqualTo("Intro to CS");
        assertThat(dto.term()).isEqualTo("Fall 2024");
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }
}
