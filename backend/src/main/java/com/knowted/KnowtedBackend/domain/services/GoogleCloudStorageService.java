package com.knowted.KnowtedBackend.domain.services;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GoogleCloudStorageService implements StorageService {

    private final Storage storage;
    private final String bucketName;

    public GoogleCloudStorageService(@Value("${gcs.bucket-name}") String bucketName) {
        this.storage = StorageOptions.getDefaultInstance().getService();
        this.bucketName = bucketName;
    }

    @Override
    public String upload(MultipartFile file) {
        try {
            // Create a unique storage key: uuid_originalfilename
            String storageReference = UUID.randomUUID() + "_" + file.getOriginalFilename();

            BlobId blobId = BlobId.of(bucketName, storageReference);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            storage.create(blobInfo, file.getBytes());

            return storageReference;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Google Cloud Storage: " + e.getMessage(), e);
        }
    }

    @Override
    public String getDownloadUrl(String storageReference) {
        // Generate a signed URL valid for 60 minutes
        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, storageReference)).build();
        return storage.signUrl(blobInfo, 60, TimeUnit.MINUTES,
                Storage.SignUrlOption.withV4Signature()).toString();
    }
}
