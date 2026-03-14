package com.knowted.KnowtedBackend.domain.services;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {

    public String upload(InputStream contentStream, String fileName, String contentType);
    public String getPresignedUrl(String storageKey, Duration expiration);
    void delete(String storageKey);
    boolean exists(String storageKey);
}