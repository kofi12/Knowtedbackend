package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.presentation.dto.CourseDto;

public class CourseMapper {

    private CourseMapper() {}

    public static CourseDto toDto(Course c) {
        return new CourseDto(
                c.getCourseId(),
                c.getUserId(),
                c.getCode(),
                c.getName(),
                c.getTerm(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}