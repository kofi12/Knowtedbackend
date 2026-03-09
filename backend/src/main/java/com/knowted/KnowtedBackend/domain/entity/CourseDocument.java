package com.knowted.KnowtedBackend.domain.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
public class CourseDocument {

    //attributes
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID documentId;

    @Column(unique = true, nullable = false)
    private UUID courseId;

    @Column(unique = true, nullable = false)
    private String originalFileName;

    @Column(unique = true, nullable = false)
    private String storageKey;

    @Column(unique = true, nullable = false)
    private String contentType;

    @Column(unique = true, nullable = false)
    private long fileSize;

    @CreationTimestamp
    private Instant uploadedAt;

    public CourseDocument(UUID documentId, UUID courseId, String originalFileName, String storageKey, String contentType, long fileSize, Instant uploadedAt) {
        this.documentId = documentId;
        this.courseId = courseId;
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public CourseDocument() {}

    //access and mutation

    public UUID getId() {
        return documentId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    //behaviour
    public String getPreviewUrl(){
        return "";
    }
}
