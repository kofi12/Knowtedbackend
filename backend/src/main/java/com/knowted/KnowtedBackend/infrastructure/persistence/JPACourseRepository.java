package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JPACourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByUserId(UUID userId);
    long countByUserId(UUID userId);
    // verify course belongs to user
    boolean existsByCourseIdAndUserId(UUID courseId, UUID userId);
}