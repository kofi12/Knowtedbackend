package com.knowted.KnowtedBackend.domain.exception;

import java.util.UUID;

@SuppressWarnings("unused")
public class StudentNotFoundException extends RuntimeException {

    public StudentNotFoundException(UUID studentId) {
        super("Student not found with id: " + studentId);
    }
}