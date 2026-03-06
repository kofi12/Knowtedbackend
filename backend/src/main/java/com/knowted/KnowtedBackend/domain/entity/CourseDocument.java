package com.knowted.KnowtedBackend.domain.entity;

import java.time.Instant;
import java.util.UUID;
import com.knowted.KnowtedBackend.domain.entity.Course;

public class CourseDocument {

    //attributes
    private UUID id;
    private Course course;
    private String originalFileName;
    private String storageKey;
    private String contentType;
    private long fileSize;
    private Instant uploadedAt;

    public CourseDocument(UUID id, Course course, String originalFileName, String storageKey, String contentType, long fileSize, Instant uploadedAt) {
        this.id = id;
        this.course = course;
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

    public Course getCourse() {
        return course;
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
