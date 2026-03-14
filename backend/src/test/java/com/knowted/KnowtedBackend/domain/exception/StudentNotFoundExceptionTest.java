package com.knowted.KnowtedBackend.domain.exception;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudentNotFoundExceptionTest {

    @Test
    void constructor_setsMessageWithId() {
        UUID id = UUID.randomUUID();
        StudentNotFoundException ex = new StudentNotFoundException(id);
        assertThat(ex.getMessage()).contains(id.toString()).contains("Student not found");
    }
}
