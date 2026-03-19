package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.exception.InvalidFileTypeException;
import com.knowted.KnowtedBackend.domain.exception.StorageOperationFailedException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CourseDocumentResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.UploadCourseDocumentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.Set;

/**
 * Placeholder for GCS document upload. Implement when domain APIs (Course.isMember, CourseDocument.create, etc.) are ready.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class GCSStorageServiceUseCase {

    private final StorageService storageService;
    private final JPACourseDocumentRepository courseDocumentRepository;
    private final JPACourseRepository courseRepository;
    @Value("${gcp.bucket.name:know-ted-bucket}")
    private String bucketName;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    @Transactional
    public CourseDocumentResponseDto execute(UploadCourseDocumentDto cmd) {

        Course course = courseRepository.findById(cmd.getCourseId())
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + cmd.getCourseId()));

        //validate file isEmpty
        if(cmd.isEmpty()){
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String contentType = normalizeContentType(cmd.getContentType());
        if (!isAllowedFile(cmd.getOriginalFilename(), contentType)) {
            throw new InvalidFileTypeException("Unsupported file type: " + contentType);
        }
        // 4. Upload to storage
        String storageKey;
        try (InputStream inputStream = cmd.getInputStream()) {
            storageKey = storageService.upload(
                    inputStream,
                    cmd.getOriginalFilename(),
                    contentType
            );
        } catch (IOException e) {
            throw new StorageOperationFailedException("Failed to read uploaded file stream", e);
        }

        CourseDocument document = CourseDocument.create(
                course,                          // Course object (teammate's choice)
                cmd.getStudentId(),
                storageKey,
                bucketName,
                cmd.getOriginalFilename(),
                contentType,
                cmd.getSize()
                // No fileHashSha256 – left as null for now
        );

        // 4. Enforce business rules (still works the same)
        course.addCourseDocument(document);

// 5. Save
        courseDocumentRepository.save(document);
        courseRepository.save(course);

        String presignedUrl = storageService.getPresignedUrl(storageKey, Duration.ofHours(1));

        // 9. Build response
        return new CourseDocumentResponseDto(
                document.getDocumentId(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSizeBytes(),
                document.getUploadedAt(),
                presignedUrl,
                course.getCourseId()
        );
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.trim().toLowerCase();
    }

    private boolean isAllowedFile(String fileName, String contentType) {
        if (ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return true;
        }
        if ("application/octet-stream".equals(contentType)) {
            String lower = fileName == null ? "" : fileName.toLowerCase();
            return lower.endsWith(".pdf")
                    || lower.endsWith(".doc")
                    || lower.endsWith(".docx")
                    || lower.endsWith(".txt")
                    || lower.endsWith(".jpg")
                    || lower.endsWith(".jpeg")
                    || lower.endsWith(".png")
                    || lower.endsWith(".gif")
                    || lower.endsWith(".pptx");
        }
        return false;
    }
}
