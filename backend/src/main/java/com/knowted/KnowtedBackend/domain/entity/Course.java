package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses")
@SuppressWarnings("unused")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "course_id")
    private UUID courseId;

    // matches schema: courses.user_id -> users.user_id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "code")
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "term")
    private String term;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseDocument> courseDocuments = new ArrayList<>();

    protected Course() {} // required by JPA

    public Course(UUID userId, String code, String name, String term) {
        this.userId = userId;
        this.code = code;
        this.name = name;
        this.term = term;
    }


    public UUID getCourseId() { return courseId; }
    public UUID getUserId() { return userId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getTerm() { return term; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<CourseDocument> getCourseDocuments() { return courseDocuments; }

    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setTerm(String term) { this.term = term; }

    public void addCourseDocument(CourseDocument doc) {
        if (courseDocuments.size() >= 50) throw new IllegalStateException("Too many courseDocuments");
        courseDocuments.add(doc);
        doc.setCourse(this);
    }

    public void removeCourseDocument(CourseDocument doc) {
        courseDocuments.remove(doc);
        doc.setCourse(null);
    }
}