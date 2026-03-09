package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataCourseDocumentRepository extends JpaRepository<CourseDocument, UUID> {

    public Optional<List<CourseDocument>> findAllByOwnerId(UUID ownerId);
}
