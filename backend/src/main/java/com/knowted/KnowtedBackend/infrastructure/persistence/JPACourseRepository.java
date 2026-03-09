package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.repository.CourseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class JPACourseRepository implements CourseRepository {

    private SpringDataCourseRepository jpaRepository;

    public JPACourseRepository(SpringDataCourseRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    public Optional<List<Course>> findAllByOwnerId(UUID ownderId){
        return jpaRepository.findAllByOwnerId(ownderId);
    }

    public Course findById(UUID id){
        return jpaRepository.findById(id).orElse(null);
    }
    public Course save(Course course){
        return jpaRepository.save(course);
    }
    public void update(UUID courseId, Course course){
        jpaRepository.save(course);
    }
    public void deleteById(UUID id){
        jpaRepository.deleteById(id);
    }

}
