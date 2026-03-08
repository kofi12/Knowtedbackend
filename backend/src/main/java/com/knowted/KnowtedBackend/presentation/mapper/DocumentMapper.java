package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.presentation.dto.DocumentDto;

import java.util.UUID;

public class DocumentMapper {

    private DocumentMapper() {}

    public static DocumentDto toDto(CourseDocument d) {
        UUID courseId = (d.getCourse() == null) ? null : d.getCourse().getCourseId();

        return new DocumentDto(
                d.getDocumentId(),
                d.getUserId(),
                courseId,
                d.getOriginalFilename(),
                d.getS3Key(),
                d.getContentType(),
                d.getFileSizeBytes(),
                d.getUploadStatus(),
                d.getUploadedAt()
        );
    }
}