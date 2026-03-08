package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.domain.entity.Document;
import com.knowted.KnowtedBackend.domain.services.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // POST /api/documents/upload
    // Upload a document — JWT required (email extracted from security context)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String userEmail) {
        try {
            Document saved = documentService.uploadDocument(file, userEmail);
            return ResponseEntity.ok(toResponse(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    // GET /api/documents
    // Get all documents for the logged-in user
    @GetMapping
    public ResponseEntity<?> getMyDocuments(@AuthenticationPrincipal String userEmail) {
        List<Document> docs = documentService.getUserDocuments(userEmail);
        return ResponseEntity.ok(docs.stream().map(this::toResponse).toList());
    }

    // GET /api/documents/{documentId}/download-url
    // Get a signed download URL for a document
    @GetMapping("/{documentId}/download-url")
    public ResponseEntity<?> getDownloadUrl(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal String userEmail) {
        try {
            String url = documentService.getDownloadUrl(documentId, userEmail);
            return ResponseEntity.ok(Map.of("downloadUrl", url));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Map entity to a clean response object (avoid exposing internals)
    private DocumentResponse toResponse(Document doc) {
        return new DocumentResponse(
                doc.getDocumentId(),
                doc.getOriginalFilename(),
                doc.getMimeType(),
                doc.getSizeBytes(),
                doc.getUploadedAt().toString()
        );
    }

    record DocumentResponse(
            UUID documentId,
            String originalFilename,
            String mimeType,
            long sizeBytes,
            String uploadedAt
    ) {}
}
