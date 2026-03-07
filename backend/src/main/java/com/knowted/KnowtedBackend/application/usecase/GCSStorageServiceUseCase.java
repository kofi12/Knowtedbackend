package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.repository.CourseDocumentRepository;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import org.springframework.context.annotation.Bean;

public class GCSStorageServiceUseCase {

    private StorageService storageService;
    private CourseDocumentRepository CourseDocumentRepository;
}
