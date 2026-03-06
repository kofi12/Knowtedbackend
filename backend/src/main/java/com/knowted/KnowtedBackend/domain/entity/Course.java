package com.knowted.KnowtedBackend.domain.entity;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class Course {

    //Attribute list
    private UUID courseId;
    private UUID ownerId;
    private String courseName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<CourseDocument> courseDocuments;

    public Course(UUID courseId, UUID ownerId, String courseName, Instant createdAt, Instant updatedAt, List<CourseDocument> courseDocuments) {
        this.courseId = courseId;
        this.ownerId = ownerId;
        this.courseName = courseName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.courseDocuments = courseDocuments;
    }

    //access and mutation
    public UUID getCourseId() {
        return courseId;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    //behaviour
    public List<CourseDocument> getCourseDocuments(){
        return courseDocuments;
    }
}
