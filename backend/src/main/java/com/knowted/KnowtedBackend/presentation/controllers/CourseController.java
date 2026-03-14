package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.CourseUseCase;
import com.knowted.KnowtedBackend.presentation.dto.CourseDto;
import com.knowted.KnowtedBackend.presentation.dto.CreateCourseRequest;
import com.knowted.KnowtedBackend.presentation.dto.UpdateCourseRequest;
import com.knowted.KnowtedBackend.presentation.mapper.CourseMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@SuppressWarnings("unused")
public class CourseController {

    private final CourseUseCase courseUseCase;

    public CourseController(CourseUseCase courseUseCase) {
        this.courseUseCase = courseUseCase;
    }

    @GetMapping("/api/courses")
    public List<CourseDto> list(@RequestParam UUID userId) {
        return courseUseCase.listCourses(userId).stream()
                .map(CourseMapper::toDto)
                .toList();
    }

    @PostMapping("/api/courses")
    public CourseDto create(@RequestParam UUID userId, @RequestBody CreateCourseRequest req) {
        return CourseMapper.toDto(courseUseCase.createCourse(userId, req));
    }

    @GetMapping("/api/courses/{courseId}")
    public CourseDto get(@RequestParam UUID userId, @PathVariable UUID courseId) {
        return CourseMapper.toDto(courseUseCase.getCourse(userId, courseId));
    }

    @PatchMapping("/api/courses/{courseId}")
    public CourseDto patch(@RequestParam UUID userId, @PathVariable UUID courseId, @RequestBody UpdateCourseRequest req) {
        return CourseMapper.toDto(courseUseCase.updateCourse(userId, courseId, req));
    }

    @DeleteMapping("/api/courses/{courseId}")
    public void delete(@RequestParam UUID userId, @PathVariable UUID courseId) {
        courseUseCase.deleteCourse(userId, courseId);
    }
}