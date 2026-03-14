package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents")
@SuppressWarnings("unused")
public class CourseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    // renamed + matches DB column
    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    // optional bucket (nullable)
    @Column(name = "storage_bucket")
    private String storageBucket;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    // optional sha256 (nullable)
    @Column(name = "file_hash_sha256")
    private String fileHashSha256;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;

    @Column(name = "upload_status", nullable = false)
    private String uploadStatus = "READY";

    protected CourseDocument() {}

    public CourseDocument(
            UUID userId,
            Course course,
            String originalFilename,
            String storageKey,
            String storageBucket,
            String contentType,
            Long fileSizeBytes,
            String fileHashSha256
    ) {
        this.userId = userId;
        this.course = course;
        this.originalFilename = originalFilename;
        this.storageKey = storageKey;
        this.storageBucket = storageBucket;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.fileHashSha256 = fileHashSha256;
    }

    public UUID getDocumentId() { return documentId; }
    public UUID getUserId() { return userId; }
    public Course getCourse() { return course; }
    public String getOriginalFilename() { return originalFilename; }
    public String getStorageKey() { return storageKey; }
    public String getStorageBucket() { return storageBucket; }
    public String getContentType() { return contentType; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public String getFileHashSha256() { return fileHashSha256; }
    public Instant getUploadedAt() { return uploadedAt; }

    public String getUploadStatus() { return uploadStatus; }
    public void setUploadStatus(String uploadStatus) { this.uploadStatus = uploadStatus; }

    void setCourse(Course course) { this.course = course; }


}