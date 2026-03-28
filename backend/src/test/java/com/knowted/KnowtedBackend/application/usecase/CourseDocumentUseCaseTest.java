package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CourseDocumentResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.DocumentBankItemDto;
import com.knowted.KnowtedBackend.presentation.dto.DownloadUrlResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseDocumentUseCaseTest {

    @Mock private JPACourseDocumentRepository documentRepository;
    @Mock private JPACourseRepository courseRepository;
    @Mock private StorageService storageService;

    @InjectMocks
    private CourseDocumentUseCase courseDocumentUseCase;

    private final UUID userId     = UUID.randomUUID();
    private final UUID courseId   = UUID.randomUUID();
    private final UUID documentId = UUID.randomUUID();

    // ─────────────────────────────────────────────────────────
    // listByCourse
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listByCourse")
    class ListByCourse {

        @Test
        @DisplayName("TC-DOC-009 - returns document DTOs for existing course")
        void listByCourse_courseFound_returnsDtos() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "lecture.pdf", "key1");

            when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
            when(documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(eq(courseId), any(Pageable.class)))
                    .thenReturn(List.of(doc));

            Pageable pageable = PageRequest.of(0, 20);
            List<CourseDocumentResponseDto> result = courseDocumentUseCase.listByCourse(courseId, pageable, userId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).documentId()).isEqualTo(documentId);
            assertThat(result.get(0).originalFilename()).isEqualTo("lecture.pdf");
            assertThat(result.get(0).courseId()).isEqualTo(courseId);
        }

        @Test
        @DisplayName("TC-DOC-009 - returns empty list when course has no documents")
        void listByCourse_noDocuments_returnsEmpty() {
            Course course = course(courseId);
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
            when(documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(eq(courseId), any(Pageable.class)))
                    .thenReturn(List.of());

            List<CourseDocumentResponseDto> result = courseDocumentUseCase.listByCourse(
                    courseId, PageRequest.of(0, 20), userId);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("TC-DOC-011 - throws CourseNotFoundException when course does not exist")
        void listByCourse_courseNotFound_throws() {
            when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    courseDocumentUseCase.listByCourse(courseId, PageRequest.of(0, 20), userId))
                    .isInstanceOf(CourseNotFoundException.class)
                    .hasMessageContaining(courseId.toString());
        }

        @Test
        @DisplayName("TC-DOC-009 - pageable is forwarded to repository unchanged")
        void listByCourse_forwardsPageable() {
            Course course = course(courseId);
            when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
            when(documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(any(), any())).thenReturn(List.of());

            Pageable page = PageRequest.of(2, 5);
            courseDocumentUseCase.listByCourse(courseId, page, userId);

            verify(documentRepository).findByCourse_CourseIdOrderByUploadedAtDesc(courseId, page);
        }

        @Test
        @DisplayName("TC-DOC-009 - presigned URL is not generated in list responses")
        void listByCourse_doesNotCallStorageService() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "notes.pdf", "key");

            when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
            when(documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(eq(courseId), any()))
                    .thenReturn(List.of(doc));

            courseDocumentUseCase.listByCourse(courseId, PageRequest.of(0, 20), userId);

            verifyNoInteractions(storageService);
        }
    }

    // ─────────────────────────────────────────────────────────
    // getDocument
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getDocument")
    class GetDocument {

        @Test
        @DisplayName("TC-DOC-012 - returns document DTO without presigned URL")
        void getDocument_found_returnsDto() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "slides.pdf", "key");

            when(documentRepository.findById(documentId)).thenReturn(Optional.of(doc));

            CourseDocumentResponseDto result = courseDocumentUseCase.getDocument(documentId, userId);

            assertThat(result.documentId()).isEqualTo(documentId);
            assertThat(result.originalFilename()).isEqualTo("slides.pdf");
            assertThat(result.presignedUrl()).isNull();
            verifyNoInteractions(storageService);
        }

        @Test
        @DisplayName("TC-DOC-014 - throws when document does not exist")
        void getDocument_notFound_throws() {
            when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

            // NoSuchElementException from Optional.orElseThrow() with no arg
            assertThatThrownBy(() -> courseDocumentUseCase.getDocument(documentId, userId))
                    .isInstanceOf(java.util.NoSuchElementException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // getPresignedUrl
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getPresignedUrl")
    class GetPresignedUrl {

        @Test
        @DisplayName("TC-DOC-015 - returns URL and expiry for default 1-hour expiry")
        void getPresignedUrl_defaultExpiry_returnsUrlAndExpiresAt() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "doc.pdf", "storage/key");

            when(documentRepository.findById(documentId)).thenReturn(Optional.of(doc));
            when(storageService.getPresignedUrl(eq("storage/key"), any(Duration.class)))
                    .thenReturn("https://signed.url/doc");

            Instant before = Instant.now();
            DownloadUrlResponse result = courseDocumentUseCase.getPresignedUrl(documentId, userId, null);
            Instant after = Instant.now();

            assertThat(result.presignedUrl()).isEqualTo("https://signed.url/doc");
            // expiresAt should be roughly 1 hour from now
            assertThat(result.expiresAt()).isAfter(before.plus(Duration.ofMinutes(59)));
            assertThat(result.expiresAt()).isBefore(after.plus(Duration.ofMinutes(61)));
        }

        @Test
        @DisplayName("TC-DOC-016 - uses custom expiry when provided and non-zero")
        void getPresignedUrl_customExpiry_usesCustom() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "doc.pdf", "storage/key");

            when(documentRepository.findById(documentId)).thenReturn(Optional.of(doc));
            when(storageService.getPresignedUrl(eq("storage/key"), eq(Duration.ofMinutes(5))))
                    .thenReturn("https://short.url");

            DownloadUrlResponse result = courseDocumentUseCase.getPresignedUrl(
                    documentId, userId, Duration.ofMinutes(5));

            assertThat(result.presignedUrl()).isEqualTo("https://short.url");
            verify(storageService).getPresignedUrl("storage/key", Duration.ofMinutes(5));
        }

        @Test
        @DisplayName("TC-DOC-016 - zero duration falls back to 1-hour default")
        void getPresignedUrl_zeroDuration_usesDefault() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "doc.pdf", "key");

            when(documentRepository.findById(documentId)).thenReturn(Optional.of(doc));
            when(storageService.getPresignedUrl(any(), any())).thenReturn("https://url");

            courseDocumentUseCase.getPresignedUrl(documentId, userId, Duration.ZERO);

            verify(storageService).getPresignedUrl("key", Duration.ofHours(1));
        }

        @Test
        @DisplayName("TC-DOC-017 - throws when document does not exist")
        void getPresignedUrl_notFound_throws() {
            when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    courseDocumentUseCase.getPresignedUrl(documentId, userId, null))
                    .isInstanceOf(java.util.NoSuchElementException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // deleteDocument
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteDocument")
    class DeleteDocument {

        @Test
        @DisplayName("TC-DOC-018 - deletes from storage, DB, and saves updated course aggregate")
        void deleteDocument_deletesStorageAndDb() {
            Course course = course(courseId);
            CourseDocument doc = document(documentId, userId, course, "old.pdf", "storage/old");
            course.addCourseDocument(doc);

            when(documentRepository.findById(documentId)).thenReturn(Optional.of(doc));
            when(courseRepository.save(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

            courseDocumentUseCase.deleteDocument(documentId, userId);

            verify(storageService).delete("storage/old");
            verify(documentRepository).deleteById(documentId);
            verify(courseRepository).save(course);
        }

        @Test
        @DisplayName("TC-DOC-019 - throws when document does not exist")
        void deleteDocument_notFound_throws() {
            when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> courseDocumentUseCase.deleteDocument(documentId, userId))
                    .isInstanceOf(java.util.NoSuchElementException.class);

            verifyNoInteractions(storageService);
        }
    }

    // ─────────────────────────────────────────────────────────
    // listAllUserDocuments (Document Bank)
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listAllUserDocuments")
    class ListAllUserDocuments {

        @Test
        @DisplayName("TC-DOC-020 - no filter returns all user documents")
        void listAllUserDocuments_noFilter_returnsAll() {
            Course course = course(courseId);
            CourseDocument d1 = document(UUID.randomUUID(), userId, course, "a.pdf", "k1");
            CourseDocument d2 = document(UUID.randomUUID(), userId, course, "b.pdf", "k2");

            when(documentRepository.findByUserIdOrderByUploadedAtDesc(userId))
                    .thenReturn(List.of(d1, d2));

            List<DocumentBankItemDto> result =
                    courseDocumentUseCase.listAllUserDocuments(userId, null, null);

            assertThat(result).hasSize(2);
            verify(documentRepository).findByUserIdOrderByUploadedAtDesc(userId);
            verify(documentRepository, never())
                    .findByUserIdAndOriginalFilenameContainingIgnoreCaseOrderByUploadedAtDesc(any(), any());
            verify(documentRepository, never())
                    .findByUserIdAndCourse_CourseIdOrderByUploadedAtDesc(any(), any());
        }

        @Test
        @DisplayName("TC-DOC-021 - filename search delegates to search repository method")
        void listAllUserDocuments_searchFilter_delegatesToSearchRepo() {
            Course course = course(courseId);
            CourseDocument doc = document(UUID.randomUUID(), userId, course, "lecture1.pdf", "k");

            when(documentRepository
                    .findByUserIdAndOriginalFilenameContainingIgnoreCaseOrderByUploadedAtDesc(userId, "lecture"))
                    .thenReturn(List.of(doc));

            List<DocumentBankItemDto> result =
                    courseDocumentUseCase.listAllUserDocuments(userId, "lecture", null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).originalFilename()).isEqualTo("lecture1.pdf");
            verify(documentRepository)
                    .findByUserIdAndOriginalFilenameContainingIgnoreCaseOrderByUploadedAtDesc(userId, "lecture");
        }

        @Test
        @DisplayName("TC-DOC-022 - courseId filter delegates to course-scoped repository method")
        void listAllUserDocuments_courseIdFilter_delegatesToCourseRepo() {
            Course course = course(courseId);
            CourseDocument doc = document(UUID.randomUUID(), userId, course, "notes.docx", "k");

            when(documentRepository
                    .findByUserIdAndCourse_CourseIdOrderByUploadedAtDesc(userId, courseId))
                    .thenReturn(List.of(doc));

            List<DocumentBankItemDto> result =
                    courseDocumentUseCase.listAllUserDocuments(userId, null, courseId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).courseId()).isEqualTo(courseId);
            verify(documentRepository)
                    .findByUserIdAndCourse_CourseIdOrderByUploadedAtDesc(userId, courseId);
        }

        @Test
        @DisplayName("TC-DOC-021 - blank search string is treated as no filter")
        void listAllUserDocuments_blankSearch_treatedAsNoFilter() {
            when(documentRepository.findByUserIdOrderByUploadedAtDesc(userId)).thenReturn(List.of());

            courseDocumentUseCase.listAllUserDocuments(userId, "   ", null);

            verify(documentRepository).findByUserIdOrderByUploadedAtDesc(userId);
            verify(documentRepository, never())
                    .findByUserIdAndOriginalFilenameContainingIgnoreCaseOrderByUploadedAtDesc(any(), any());
        }

        @Test
        @DisplayName("TC-DOC-023 - returns empty list for user with no documents")
        void listAllUserDocuments_noDocuments_returnsEmpty() {
            when(documentRepository.findByUserIdOrderByUploadedAtDesc(userId))
                    .thenReturn(List.of());

            List<DocumentBankItemDto> result =
                    courseDocumentUseCase.listAllUserDocuments(userId, null, null);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("TC-DOC-020 - returned DTO includes courseId and courseName from parent course")
        void listAllUserDocuments_dtosContainCourseMetadata() {
            Course course = course(courseId);
            ReflectionTestUtils.setField(course, "name", "Algorithms");
            CourseDocument doc = document(UUID.randomUUID(), userId, course, "week1.pdf", "k");

            when(documentRepository.findByUserIdOrderByUploadedAtDesc(userId))
                    .thenReturn(List.of(doc));

            List<DocumentBankItemDto> result =
                    courseDocumentUseCase.listAllUserDocuments(userId, null, null);

            assertThat(result.get(0).courseId()).isEqualTo(courseId);
            assertThat(result.get(0).courseName()).isEqualTo("Algorithms");
        }
    }

    // ─────────────────────────────────────────────────────────
    // Test data helpers
    // ─────────────────────────────────────────────────────────

    private Course course(UUID id) {
        Course c = new Course(userId, "CS101", "Course Name", "F25");
        ReflectionTestUtils.setField(c, "courseId", id);
        return c;
    }

    private CourseDocument document(UUID id, UUID owner, Course course,
                                    String filename, String storageKey) {
        CourseDocument doc = CourseDocument.create(course, owner, storageKey,
                "bucket", filename, "application/pdf", 1024L);
        ReflectionTestUtils.setField(doc, "documentId", id);
        ReflectionTestUtils.setField(doc, "uploadedAt", Instant.now());
        return doc;
    }
}
