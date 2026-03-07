package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.repository.CourseRepository;

import java.util.List;
import java.util.UUID;

public class JPACourseRepository implements CourseRepository {

    public List<CourseDocument> findAll(){

    }
    public Course findById(UUID id){}
    public Course create(Course course){}
    public void update(UUID courseId, Course course){}
    public void deleteById(UUID id){}

}
