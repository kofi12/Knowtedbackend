package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.presentation.dto.DocumentDto;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentMapperTest {

    @Test
    void toDto_mapsAllFields() {
        UUID docId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Course course = new Course(userId, "C1", "Course", null);
        org.springframework.test.util.ReflectionTestUtils.setField(course, "courseId", courseId);

        CourseDocument doc = new CourseDocument(
                userId, course, "notes.pdf", "key", "bucket", "application/pdf", 1024L, "hash");
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "documentId", docId);
        Instant uploadedAt = Instant.now();
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "uploadedAt", uploadedAt);

        DocumentDto dto = DocumentMapper.toDto(doc);

        assertThat(dto.documentId()).isEqualTo(docId);
        assertThat(dto.userId()).isEqualTo(userId);
        assertThat(dto.courseId()).isEqualTo(courseId);
        assertThat(dto.originalFilename()).isEqualTo("notes.pdf");
        assertThat(dto.storageKey()).isEqualTo("key");
        assertThat(dto.storageBucket()).isEqualTo("bucket");
        assertThat(dto.contentType()).isEqualTo("application/pdf");
        assertThat(dto.fileSizeBytes()).isEqualTo(1024L);
        assertThat(dto.fileHashSha256()).isEqualTo("hash");
        assertThat(dto.uploadStatus()).isEqualTo("READY");
        assertThat(dto.uploadedAt()).isEqualTo(uploadedAt);
    }

    @Test
    void toDto_nullCourse_returnsNullCourseId() {
        CourseDocument doc = new CourseDocument(
                UUID.randomUUID(), null, "f.pdf", "k", null, null, null, null);

        DocumentDto dto = DocumentMapper.toDto(doc);

        assertThat(dto.courseId()).isNull();
    }
}
