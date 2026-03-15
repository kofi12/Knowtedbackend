package com.knowted.KnowtedBackend.infrastructure.gcs;

import com.knowted.KnowtedBackend.domain.services.StorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Duration;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "noop")
@SuppressWarnings("unused")
public class NoopStorageService implements StorageService {

    @Override
    public String upload(InputStream contentStream, String fileName, String contentType) {
        throw new UnsupportedOperationException("Storage provider is NOOP in this environment");
    }

    @Override
    public String getPresignedUrl(String storageKey, Duration expiration) {
        throw new UnsupportedOperationException("Storage provider is NOOP in this environment");
    }

    @Override
    public void delete(String storageKey) {
        // best effort no-op
    }

    @Override
    public boolean exists(String storageKey) {
        return false;
    }
}