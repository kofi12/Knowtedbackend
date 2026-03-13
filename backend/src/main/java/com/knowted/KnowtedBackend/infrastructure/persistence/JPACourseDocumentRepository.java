package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface JPACourseDocumentRepository extends JpaRepository<CourseDocument, UUID> {
    long countByUserId(UUID userId);

     // for dashboard recent (all user docs)
    List<CourseDocument> findByUserIdOrderByUploadedAtDesc(UUID userId, Pageable pageable);

    // for dashboard recent (course-scoped)
    List<CourseDocument> findByCourse_CourseIdOrderByUploadedAtDesc(UUID courseId, Pageable pageable);

    // optional: count per course (useful for course page stats)
    long countByCourse_CourseId(UUID courseId);

    //needed for course deletion
    List<CourseDocument> findByCourse_CourseId(UUID courseId);
}