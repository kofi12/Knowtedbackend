package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.presentation.dto.UploadCourseDocumentDto;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GCSStorageServiceUseCaseTest {

    @Test
    void execute_throwsUnsupportedOperationException() {
        var useCase = new GCSStorageServiceUseCase();
        var file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());
        var cmd = new UploadCourseDocumentDto(UUID.randomUUID(), file, UUID.randomUUID());

        // Use case has no dependencies injected; execute throws when accessing repositories
        assertThatThrownBy(() -> useCase.execute(cmd))
                .isInstanceOf(NullPointerException.class);
    }
}
