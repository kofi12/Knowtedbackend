package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.presentation.dto.CourseDocumentResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.UploadCourseDocumentDto;
import org.springframework.stereotype.Service;

/**
 * Placeholder for GCS document upload. Implement when domain APIs (Course.isMember, CourseDocument.create, etc.) are ready.
 */
@Service
@SuppressWarnings("unused")
public class GCSStorageServiceUseCase {

    public CourseDocumentResponseDto execute(UploadCourseDocumentDto cmd) {
        throw new UnsupportedOperationException("GCSStorageServiceUseCase not yet implemented");
    }
}
