package com.knowted.KnowtedBackend.domain.repository;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;

import java.util.UUID;

public interface CourseDocumentRepository {

    public CourseDocument findById(UUID id);
    public CourseDocument save(CourseDocument courseDocument);
    public CourseDocument update(UUID id, CourseDocument courseDocument);
    public void deleteById(UUID id);
}
