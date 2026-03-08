package com.knowted.KnowtedBackend.domain.services;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    // Uploads file to storage, returns the storage reference key
    String upload(MultipartFile file);

    // Returns a signed/public URL to access the file
    String getDownloadUrl(String storageReference);
}
