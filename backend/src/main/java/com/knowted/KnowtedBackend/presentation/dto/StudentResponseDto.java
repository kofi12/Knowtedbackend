package com.knowted.KnowtedBackend.presentation.dto;

import java.util.UUID;

public class StudentResponseDto {

    private UUID studentId;
    private String email;
    private String displayName;

    public StudentResponseDto(UUID studentId, String email, String displayName) {
        this.studentId = studentId;
        this.email = email;
        this.displayName = displayName;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }
}