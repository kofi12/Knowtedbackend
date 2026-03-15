package com.knowted.KnowtedBackend.domain.services;

import com.knowted.KnowtedBackend.domain.entity.Document;
import com.knowted.KnowtedBackend.domain.entity.User;
import com.knowted.KnowtedBackend.domain.services.DocumentRepository;
import com.knowted.KnowtedBackend.domain.services.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final StorageService storageService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    // Max file size: 50MB
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    // Allowed MIME types
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    public DocumentService(StorageService storageService,
                           DocumentRepository documentRepository,
                           UserRepository userRepository) {
        this.storageService = storageService;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    public Document uploadDocument(MultipartFile file, String userEmail) {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 50MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Unsupported file type: " + file.getContentType()
                    + ". Allowed types: PDF, DOC, DOCX, TXT");
        }

        // Get or create user
        User user = userRepository.findByEmail(userEmail)
                .orElseGet(() -> {
                    User newUser = new User(userEmail, null);
                    return userRepository.save(newUser);
                });

        // Upload to GCS
        String storageReference = storageService.upload(file);

        // Save document metadata to DB
        Document document = new Document(
                user,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                storageReference
        );

        return documentRepository.save(document);
    }

    public List<Document> getUserDocuments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return documentRepository.findByUser_UserId(user.getUserId());
    }

    public String getDownloadUrl(UUID documentId, String userEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Make sure the requesting user owns this document
        if (!document.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Access denied");
        }

        return storageService.getDownloadUrl(document.getStorageReference());
    }
}
