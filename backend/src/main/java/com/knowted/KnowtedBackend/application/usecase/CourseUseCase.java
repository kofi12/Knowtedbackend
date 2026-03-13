package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CreateCourseRequest;
import com.knowted.KnowtedBackend.presentation.dto.UpdateCourseRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CourseUseCase {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CourseUseCase.class);
    private final JPACourseRepository courseRepository;
    private final JPACourseDocumentRepository documentRepository;
    private final StorageService storageService;

    public CourseUseCase(
            JPACourseRepository courseRepository,
            JPACourseDocumentRepository documentRepository,
            StorageService storageService
    ) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    public List<Course> listCourses(UUID userId) {
        return courseRepository.findByUserId(userId);
    }

    public Course createCourse(UUID userId, CreateCourseRequest req) {
        if (req == null || req.name() == null || req.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course name is required");
        }

        Course course = new Course(
                userId,
                req.code(),
                req.name(),
                req.term()
        );

        return courseRepository.save(course);
    }

    public Course getCourse(UUID userId, UUID courseId) {
        return courseRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    public Course updateCourse(UUID userId, UUID courseId, UpdateCourseRequest req) {
        Course existing = getCourse(userId, courseId);

        // patch semantics: only update non-null fields
        if (req.code() != null) existing.setCode(req.code());
        if (req.name() != null) existing.setName(req.name());
        if (req.term() != null) existing.setTerm(req.term());

        return courseRepository.save(existing);
    }

    public void deleteCourse(UUID userId, UUID courseId) {
    Course existing = getCourse(userId, courseId);

    // fetch docs before deleting course so we still have storage keys
    var docs = documentRepository.findByCourse_CourseId(courseId);

    // best-effort GCS deletes: try all, don’t block DB delete
    for (var doc : docs) {
        String key = doc.getStorageKey();
        if (key == null || key.isBlank()) continue;

        try {
            storageService.delete(key);
        } catch (Exception e) {
            // best-effort: log and continue
            log.warn("Failed to delete GCS object for courseId={} key={}", courseId, key, e);
        }
    }

    // delete course; DB FK ON DELETE CASCADE removes documents rows
    courseRepository.delete(existing);
}
}