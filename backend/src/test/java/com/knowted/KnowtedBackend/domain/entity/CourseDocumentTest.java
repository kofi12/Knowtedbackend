package com.knowted.KnowtedBackend.domain.entity;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CourseDocumentTest {

    @Test
    void constructor_setsAllFields() {
        UUID userId = UUID.randomUUID();
        Course course = new Course(userId, "CS101", "Course", "Fall");
        String originalFilename = "notes.pdf";
        String storageKey = "docs/notes.pdf";
        String storageBucket = "my-bucket";
        String contentType = "application/pdf";
        Long fileSizeBytes = 1024L;
        String fileHash = "abc123";

        CourseDocument doc = new CourseDocument(
                userId, course, originalFilename, storageKey, storageBucket, contentType, fileSizeBytes, fileHash);

        assertThat(doc.getUserId()).isEqualTo(userId);
        assertThat(doc.getCourse()).isSameAs(course);
        assertThat(doc.getOriginalFilename()).isEqualTo(originalFilename);
        assertThat(doc.getStorageKey()).isEqualTo(storageKey);
        assertThat(doc.getStorageBucket()).isEqualTo(storageBucket);
        assertThat(doc.getContentType()).isEqualTo(contentType);
        assertThat(doc.getFileSizeBytes()).isEqualTo(fileSizeBytes);
        assertThat(doc.getFileHashSha256()).isEqualTo(fileHash);
        assertThat(doc.getUploadStatus()).isEqualTo("READY");
    }

    @Test
    void setUploadStatus_updatesStatus() {
        CourseDocument doc = new CourseDocument(
                UUID.randomUUID(), null, "f.pdf", "key", null, null, null, null);
        doc.setUploadStatus("PROCESSING");
        assertThat(doc.getUploadStatus()).isEqualTo("PROCESSING");
    }

    @Test
    void constructor_withNullOptionalFields() {
        CourseDocument doc = new CourseDocument(
                UUID.randomUUID(), null, "f.pdf", "key", null, null, null, null);
        assertThat(doc.getStorageBucket()).isNull();
        assertThat(doc.getContentType()).isNull();
        assertThat(doc.getFileSizeBytes()).isNull();
        assertThat(doc.getFileHashSha256()).isNull();
    }
}
