package com.knowted.KnowtedBackend.domain.services;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    public String upload(MultipartFile file);
    public String download(MultipartFile file);
}