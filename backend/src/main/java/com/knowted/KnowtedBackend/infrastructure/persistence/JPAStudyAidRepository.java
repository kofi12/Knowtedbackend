package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JPAStudyAidRepository extends JpaRepository<StudyAid, UUID> {
    long countByUserId(UUID userId);

    // for dashboard recent (all user aids)
    List<StudyAid> findByUserIdOrderByUpdatedAtDesc(UUID userId, Pageable pageable);

    // for dashboard recent (course-scoped)
    List<StudyAid> findByCourse_CourseIdOrderByUpdatedAtDesc(UUID courseId, Pageable pageable);

    long countByCourse_CourseId(UUID courseId);
}