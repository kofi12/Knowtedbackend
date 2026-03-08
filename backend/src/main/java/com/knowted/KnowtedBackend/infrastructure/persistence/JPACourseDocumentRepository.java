package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JPACourseDocumentRepository extends JpaRepository<CourseDocument, UUID> {
    List<CourseDocument> findByCourse_CourseId(UUID courseId);
}