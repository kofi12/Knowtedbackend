package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "study_aids")
@SuppressWarnings("unused")
public class StudyAid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "study_aid_id")
    private UUID studyAidId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "type_id", nullable = false)
    private Short typeId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "generation_status", nullable = false)
    private String generationStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    protected StudyAid() {
    }

    // factory method to create a new study aid for flashcard generation
    public static StudyAid create(UUID userId, Course course, UUID documentId, short typeId, String title) {
        StudyAid aid = new StudyAid();
        aid.userId = userId;
        aid.course = course;
        aid.documentId = documentId;
        aid.typeId = typeId;
        aid.title = title;
        aid.generationStatus = "PENDING";
        return aid;
    }

    public void setGenerationStatus(String generationStatus) { this.generationStatus = generationStatus; }

    public UUID getStudyAidId() { return studyAidId; }
    public UUID getUserId() { return userId; }
    public Course getCourse() { return course; }
    public UUID getDocumentId() { return documentId; }
    public Short getTypeId() { return typeId; }
    public String getTitle() { return title; }
    public String getGenerationStatus() { return generationStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}