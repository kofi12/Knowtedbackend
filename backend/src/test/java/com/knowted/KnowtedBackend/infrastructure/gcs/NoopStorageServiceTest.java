package com.knowted.KnowtedBackend.infrastructure.gcs;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NoopStorageServiceTest {

    private NoopStorageService noopStorageService;

    @BeforeEach
    void setUp() {
        noopStorageService = new NoopStorageService();
    }

    @Test
    void upload_throwsUnsupportedOperationException() {
        InputStream stream = new ByteArrayInputStream("test".getBytes());

        assertThatThrownBy(() -> noopStorageService.upload(stream, "file.pdf", "application/pdf"))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("NOOP");
    }

    @Test
    void getPresignedDownloadUrl_throwsUnsupportedOperationException() {
        assertThatThrownBy(() -> noopStorageService.getPresignedUrl("key", Duration.ofMinutes(5)))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("NOOP");
    }

    @Test
    void delete_doesNotThrow() {
        noopStorageService.delete("any-key");
    }

    @Test
    void exists_alwaysReturnsFalse() {
        assertThat(noopStorageService.exists("any-key")).isFalse();
    }
}
