package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPAStudyAidRepository;
import com.knowted.KnowtedBackend.presentation.dto.DashboardRecentDto;
import com.knowted.KnowtedBackend.presentation.dto.DashboardSummaryDto;
import com.knowted.KnowtedBackend.presentation.mapper.DocumentMapper;
import com.knowted.KnowtedBackend.presentation.mapper.StudyAidMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@SuppressWarnings("unused")
public class DashboardUseCase {

    private final JPACourseRepository courseRepository;
    private final JPACourseDocumentRepository documentRepository;
    private final JPAStudyAidRepository studyAidRepository;

    public DashboardUseCase(
            JPACourseRepository courseRepository,
            JPACourseDocumentRepository documentRepository,
            JPAStudyAidRepository studyAidRepository
    ) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.studyAidRepository = studyAidRepository;
    }

    public DashboardSummaryDto getSummary(UUID userId) {
        long activeCourses = courseRepository.countByUserId(userId);
        long studyMaterials = documentRepository.countByUserId(userId);
        long generatedAids = studyAidRepository.countByUserId(userId);

        return new DashboardSummaryDto(activeCourses, studyMaterials, generatedAids);
    }

    public DashboardRecentDto getRecent(UUID userId, UUID courseId, int limit) {
    int safeLimit = Math.max(1, Math.min(limit, 50));
    var pageable = PageRequest.of(0, safeLimit);

    // If courseId is provided, ensure it belongs to this user (recommended)
    if (courseId != null) {
        boolean owns = courseRepository.existsByCourseIdAndUserId(courseId, userId);
        if (!owns) {
            throw new IllegalArgumentException("Course not found for this user");
            // later: throw ResponseStatusException(HttpStatus.NOT_FOUND, ...)
        }

        var recentDocs = documentRepository
                .findByCourse_CourseIdOrderByUploadedAtDesc(courseId, pageable)
                .stream().map(DocumentMapper::toDto).toList();

        var recentAids = studyAidRepository
                .findByCourse_CourseIdOrderByUpdatedAtDesc(courseId, pageable)
                .stream().map(StudyAidMapper::toDto).toList();

        return new DashboardRecentDto(recentDocs, recentAids);
    }

    // Otherwise, return recents across all courses for user
    var recentDocs = documentRepository
            .findByUserIdOrderByUploadedAtDesc(userId, pageable)
            .stream().map(DocumentMapper::toDto).toList();

    var recentAids = studyAidRepository
            .findByUserIdOrderByUpdatedAtDesc(userId, pageable)
            .stream().map(StudyAidMapper::toDto).toList();

    return new DashboardRecentDto(recentDocs, recentAids);
}
}