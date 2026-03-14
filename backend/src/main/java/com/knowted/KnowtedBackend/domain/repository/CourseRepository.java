package com.knowted.KnowtedBackend.domain.repository;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;

import java.util.List;
import java.util.UUID;

public interface CourseRepository {

    public List<CourseDocument> findAll();
    public Course findById(UUID id);
    public Course save(Course course);
    public void update(UUID courseId, Course updatedCourse);
    public void deleteById(UUID id);
}
