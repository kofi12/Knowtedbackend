package com.knowted.KnowtedBackend.domain.repository;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseDocumentRepository {

    public CourseDocument findById(UUID documentId);
    public Optional<List<CourseDocument>> findAllByOwnerId(UUID ownerId);
    public CourseDocument save(CourseDocument courseDocument);
    public CourseDocument update(UUID id, CourseDocument courseDocument);
    public void deleteById(UUID documentId);
}
