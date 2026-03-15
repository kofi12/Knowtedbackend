package com.knowted.KnowtedBackend.domain.exception;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudentNotFoundExceptionTest {

    @Test
    void constructor_setsMessageWithId() {
        String message = "Student not found";
        StudentNotFoundException ex = new StudentNotFoundException(message);
        assertThat(ex.getMessage()).contains(message.toString()).contains("Student not found");
    }
}
