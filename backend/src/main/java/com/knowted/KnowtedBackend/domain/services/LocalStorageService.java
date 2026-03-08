package com.knowted.KnowtedBackend.domain.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final String uploadDir;

    public LocalStorageService(@Value("${storage.local.upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public String upload(MultipartFile file) {
        try {
            // Create the upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create a unique filename so duplicates don't overwrite each other
            String storageReference = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(storageReference);

            // Save the file
            file.transferTo(filePath.toFile());

            return storageReference;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file locally: " + e.getMessage(), e);
        }
    }

    @Override
    public String getDownloadUrl(String storageReference) {
        // For local dev, just return the file path
        return uploadDir + "/" + storageReference;
    }
}
