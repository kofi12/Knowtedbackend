package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JPAStudyAidRepository extends JpaRepository<StudyAid, UUID> {
    long countByUserId(UUID userId);

    @Query("SELECT sa FROM StudyAid sa LEFT JOIN FETCH sa.course WHERE sa.studyAidId = :id")
    Optional<StudyAid> findByIdWithCourse(@Param("id") UUID id);

    @Query("SELECT sa FROM StudyAid sa LEFT JOIN FETCH sa.course WHERE sa.course.courseId = :courseId AND sa.typeId = :typeId")
    List<StudyAid> findByCourseIdAndTypeIdWithCourse(@Param("courseId") UUID courseId, @Param("typeId") Short typeId);

    // for dashboard recent (all user aids)
    List<StudyAid> findByUserIdOrderByUpdatedAtDesc(UUID userId, Pageable pageable);

    // for dashboard recent (course-scoped)
    List<StudyAid> findByCourse_CourseIdOrderByUpdatedAtDesc(UUID courseId, Pageable pageable);

    long countByCourse_CourseId(UUID courseId);

    // find all study aids for a course filtered by type (e.g. type_id=1 for flashcard decks)
    List<StudyAid> findByCourse_CourseIdAndTypeId(UUID courseId, Short typeId);
}