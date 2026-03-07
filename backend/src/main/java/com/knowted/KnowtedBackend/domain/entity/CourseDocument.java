package com.knowted.KnowtedBackend.domain.entity;

import java.time.Instant;
import java.util.UUID;
import com.knowted.KnowtedBackend.domain.entity.Course;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Id;

@Entity
public class CourseDocument {

    //attributes
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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

    public CourseDocument(UUID id, UUID courseId, String originalFileName, String storageKey, String contentType, long fileSize, Instant uploadedAt) {
        this.id = id;
        this.courseId = courseId;
        this.originalFileName = originalFileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    //access and mutation

    public UUID getId() {
        return id;
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
