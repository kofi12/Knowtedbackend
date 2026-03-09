package com.knowted.KnowtedBackend.infrastructure.gcs;

import com.google.cloud.storage.*;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import org.springframework.beans.factory.annotation.Value;

import java.io.InputStream;
import java.time.Duration;

public class GCSStorageService implements StorageService {

    private final Storage googleStorage;
    private final String bucketName;

    public GCSStorageService( @Value("${gcp.bucket.name}")String bucketName) {
        this.googleStorage = StorageOptions.getDefaultInstance().getService();
        this.bucketName = bucketName;
    }

    @Override
    public String upload(InputStream contentStream, String fileName, String contentType, long contentLength) {
        return "";
    }

    @Override
    public String getPresignedDownloadUrl(String storageKey, Duration expiration) {
        return "";
    }

    @Override
    public void delete(String storageKey) {

    }

    @Override
    public boolean exists(String storageKey) {
        return false;
    }
}
