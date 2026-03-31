package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.CourseUseCase;
import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.presentation.dto.CourseDto;
import com.knowted.KnowtedBackend.presentation.dto.CreateCourseRequest;
import com.knowted.KnowtedBackend.presentation.dto.UpdateCourseRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@SuppressWarnings("unused")
public class CourseController {

    private final CourseUseCase courseUseCase;
    private final JPACourseDocumentRepository courseDocumentRepository;

    public CourseController(CourseUseCase courseUseCase, JPACourseDocumentRepository courseDocumentRepository) {
        this.courseUseCase = courseUseCase;
        this.courseDocumentRepository = courseDocumentRepository;
    }

    @GetMapping("/api/courses")
    public List<CourseDto> list(@RequestParam UUID userId) {
        return courseUseCase.listCourses(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/api/courses")
    public CourseDto create(@RequestParam UUID userId, @RequestBody CreateCourseRequest req) {
        return toDto(courseUseCase.createCourse(userId, req));
    }

    @GetMapping("/api/courses/{courseId}")
    public CourseDto get(@RequestParam UUID userId, @PathVariable UUID courseId) {
        return toDto(courseUseCase.getCourse(userId, courseId));
    }

    @PatchMapping("/api/courses/{courseId}")
    public CourseDto patch(@RequestParam UUID userId, @PathVariable UUID courseId, @RequestBody UpdateCourseRequest req) {
        return toDto(courseUseCase.updateCourse(userId, courseId, req));
    }

    @DeleteMapping("/api/courses/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam UUID userId, @PathVariable UUID courseId) {
        courseUseCase.deleteCourse(userId, courseId);
    }

    private CourseDto toDto(Course course) {
        long materialCount = courseDocumentRepository.countByCourse_CourseId(course.getCourseId());
        return new CourseDto(
                course.getCourseId(),
                course.getUserId(),
                course.getCode(),
                course.getName(),
                course.getTerm(),
                course.getCreatedAt(),
                course.getUpdatedAt(),
                materialCount
        );
    }
}