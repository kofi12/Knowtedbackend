package com.knowted.KnowtedBackend.domain.entity;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
public class Course {

    //Attribute list
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID courseId;

    @Column(unique = true, nullable = false)
    private UUID ownerId;

    @Column(unique = true, nullable = false)
    private String courseName;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(mappedBy = "courseId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseDocument> courseDocuments;

    public Course(UUID courseId, UUID ownerId, String courseName, Instant createdAt, Instant updatedAt, List<CourseDocument> courseDocuments) {
        this.courseId = courseId;
        this.ownerId = ownerId;
        this.courseName = courseName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.courseDocuments = courseDocuments;
    }

    public Course() {
        
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

    public List<CourseDocument> getCourseDocuments(){
        return courseDocuments;
    }

    //behaviour
    public void addCourseDocument(CourseDocument courseDocument){
        if(courseDocuments.size() >= 50) {
            throw new IllegalStateException("Too many courseDocuments");
        }
        courseDocuments.add(courseDocument);
    }
}
