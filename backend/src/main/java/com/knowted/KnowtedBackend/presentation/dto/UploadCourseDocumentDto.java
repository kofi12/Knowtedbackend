package com.knowted.KnowtedBackend.presentation.dto;

import com.google.auto.value.AutoValue;
import kotlin.BuilderInference;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Builder
public record UploadCourseDocumentDto(
        UUID courseId,
        MultipartFile file,
        UUID studentId
) {
    public String getOriginalFilename() {
        return file.getOriginalFilename();
    }

    public InputStream getInputStream() throws IOException {
        return file.getInputStream();
    }

    public String getContentType() {
        return file.getContentType();
    }

    public long getSize() {
        return file.getSize();
    }

    public boolean  isEmpty() {
        return file.isEmpty();
    }

    public UUID getCourseId() {
        return courseId;
    }

    public UUID getStudentId() {
        return studentId;
    }
}
