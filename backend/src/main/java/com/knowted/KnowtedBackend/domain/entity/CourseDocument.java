package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class CourseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id")
    private UUID documentId;

    // matches schema: documents.user_id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // matches schema: documents.course_id (nullable allowed)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;

    @Column(name = "upload_status", nullable = false)
    private String uploadStatus = "READY";

    public String getUploadStatus() {
        return uploadStatus;
    }

    public void setUploadStatus(String uploadStatus) {
        this.uploadStatus = uploadStatus;
    }
    protected CourseDocument() {} // required by JPA

    public CourseDocument(UUID userId, Course course, String originalFilename, String s3Key,
                          String contentType, Long fileSizeBytes) {
        this.userId = userId;
        this.course = course;
        this.originalFilename = originalFilename;
        this.s3Key = s3Key;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
    }

    public UUID getDocumentId() { return documentId; }
    public UUID getUserId() { return userId; }
    public Course getCourse() { return course; }
    public String getOriginalFilename() { return originalFilename; }
    public String getS3Key() { return s3Key; }
    public String getContentType() { return contentType; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public Instant getUploadedAt() { return uploadedAt; }

    void setCourse(Course course) { this.course = course; }
}