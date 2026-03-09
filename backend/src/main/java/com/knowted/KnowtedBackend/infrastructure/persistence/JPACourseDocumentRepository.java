package com.knowted.KnowtedBackend.infrastructure.persistence;


import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.repository.CourseDocumentRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class JPACourseDocumentRepository implements CourseDocumentRepository {

    private SpringDataCourseDocumentRepository jpaCourseDocumentRepository;

    public CourseDocument findById(UUID documentId) {
        return jpaCourseDocumentRepository.findById(documentId).orElse(null);
    }

    public Optional<List<CourseDocument>> findAllByOwnerId(UUID ownerId) {
        return jpaCourseDocumentRepository.findAllByOwnerId(ownerId);
    }

    public CourseDocument save(CourseDocument courseDocument) {
        return jpaCourseDocumentRepository.save(courseDocument);
    }

    public CourseDocument update(UUID documentId, CourseDocument courseDocument) {
        return jpaCourseDocumentRepository.save(courseDocument);
    }

    public void deleteById(UUID documentId) {
        jpaCourseDocumentRepository.deleteById(documentId);
    }
}
