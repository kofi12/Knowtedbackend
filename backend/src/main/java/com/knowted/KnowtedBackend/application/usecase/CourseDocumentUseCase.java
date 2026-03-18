package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CourseDocumentResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.DownloadUrlResponse;
import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Handles all post-upload operations for CourseDocuments:
 * - List documents in a course
 * - Get document metadata
 * - Generate fresh presigned URL for viewing/downloading
 * - Delete document (metadata + GCS object)
 */
@Service
@RequiredArgsConstructor
public class CourseDocumentUseCase {

        private final JPACourseDocumentRepository documentRepository;
        private final JPACourseRepository courseRepository;
        private final StorageService storageService;

        private static final Duration DEFAULT_URL_EXPIRY = Duration.ofHours(1);

        /**
         * GET /api/courses/{courseId}/documents
         * Lists documents in a course, sorted by upload time descending
         */
        public List<CourseDocumentResponseDto> listByCourse(
                        UUID courseId,
                        Pageable pageable,
                        UUID requesterId) {

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId));

                return documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(courseId, pageable)
                                .stream()
                                .map(doc -> toResponse(doc, false))
                                .collect(Collectors.toList());
        }

        /**
         * GET /api/documents/{documentId}
         * Returns metadata for a single document
         */
        public CourseDocumentResponseDto getDocument(
                        UUID documentId,
                        UUID requesterId) {

                CourseDocument doc = documentRepository.findById(documentId)
                                .orElseThrow();

                Course course = doc.getCourse();

                return toResponse(doc, false);
        }

        /**
         * GET /api/documents/{documentId}/presigned-url
         * Generates a fresh, short-lived presigned URL for viewing/downloading the file
         */
        public DownloadUrlResponse getPresignedUrl(
                        UUID documentId,
                        UUID requesterId,
                        Duration expiryDuration) {

                CourseDocument doc = documentRepository.findById(documentId)
                                .orElseThrow();

                Course course = doc.getCourse();

                Duration expiry = (expiryDuration != null && !expiryDuration.isZero())
                                ? expiryDuration
                                : DEFAULT_URL_EXPIRY;

                String url = storageService.getPresignedUrl(doc.getStorageKey(), expiry);
                Instant expiresAt = Instant.now().plus(expiry);

                return new DownloadUrlResponse(url, expiresAt);
        }

        /**
         * DELETE /api/documents/{documentId}
         * Removes the document metadata from DB and the file from GCS
         */
        @Transactional
        public void deleteDocument(
                        UUID documentId,
                        UUID deleterId) {

                CourseDocument doc = documentRepository.findById(documentId)
                                .orElseThrow();

                Course course = doc.getCourse();

                // Remove from aggregate root
                course.removeCourseDocument(doc);

                // Delete actual file from GCS
                storageService.delete(doc.getStorageKey());

                // Remove from database
                documentRepository.deleteById(documentId);

                // Save course if aggregate consistency requires it
                courseRepository.save(course);
        }

        // ────────────────────────────────────────────────
        // Internal helpers
        // ────────────────────────────────────────────────

        private CourseDocumentResponseDto toResponse(CourseDocument doc, boolean includePresignedUrl) {
                String presignedUrl = includePresignedUrl
                                ? storageService.getPresignedUrl(doc.getStorageKey(), DEFAULT_URL_EXPIRY)
                                : null;

                return new CourseDocumentResponseDto(
                                doc.getDocumentId(),
                                doc.getOriginalFilename(),
                                doc.getContentType(),
                                doc.getFileSizeBytes(),
                                doc.getUploadedAt(),
                                presignedUrl,
                                doc.getCourse().getCourseId());
        }
}