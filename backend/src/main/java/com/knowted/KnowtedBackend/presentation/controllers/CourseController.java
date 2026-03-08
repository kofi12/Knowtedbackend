package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CourseDto;
import com.knowted.KnowtedBackend.presentation.mapper.CourseMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final JPACourseRepository courseRepository;

    public CourseController(JPACourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // TEMP: pass userId as query param until auth is wired into controllers
    @GetMapping
    public List<CourseDto> listCourses(@RequestParam UUID userId) {
        return courseRepository.findByUserId(userId).stream()
                .map(CourseMapper::toDto)
                .toList();
    }
}