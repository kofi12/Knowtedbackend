package com.knowted.KnowtedBackend.infrastructure.gcs;

import com.google.cloud.storage.*;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;

@Service
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
  name = "storage.provider",
  havingValue = "gcs"
)
public class GCSStorageService implements StorageService {

    private final Storage googleStorage;
    private final String bucketName;
    private static final org.slf4j.Logger log =
        org.slf4j.LoggerFactory.getLogger(GCSStorageService.class);

    public GCSStorageService( @Value("${gcp.bucket.name}")String bucketName) {
        this.googleStorage = StorageOptions.getDefaultInstance().getService();
        this.bucketName = bucketName;
    }

    @Override
    public String upload(InputStream contentStream, String fileName, String contentType) {
        String safeName = fileName == null ? "file" : fileName.replaceAll("[\\\\/]+", "_");
        String storageKey = "documents/" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID().toString().substring(0, 6) +
                "_" + safeName;

        BlobId blobId = BlobId.of(bucketName, storageKey);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(contentType).build();

        try {
            googleStorage.createFrom(blobInfo, contentStream);
        } catch(IOException e) {
            throw new RuntimeException("Failed to upload content to GCS", e);
        }

        return storageKey;
    }

    @Override
    public String getPresignedDownloadUrl(String storageKey, Duration expiration) {

        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, storageKey).build();

        URL signedUrl = googleStorage.signUrl(blobInfo, expiration.getSeconds(), TimeUnit.SECONDS,
                Storage.SignUrlOption.httpMethod(HttpMethod.GET), Storage.SignUrlOption.withV4Signature());

        return signedUrl.toString();
    }

    @Override
    public void delete(String storageKey) {

        BlobId blobId = BlobId.of(bucketName, storageKey);
        boolean deleted = googleStorage.delete(blobId);
        if (!deleted) {
            log.debug("GCS object not found: {}/{}", bucketName, storageKey);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        Blob blob = googleStorage.get(BlobId.of(bucketName, storageKey));
        return blob != null;
    }
}
