package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.presentation.dto.CourseDocumentResponseDto;
import com.knowted.KnowtedBackend.presentation.dto.DocumentBankItemDto;
import com.knowted.KnowtedBackend.presentation.dto.DownloadUrlResponse;
import com.knowted.KnowtedBackend.presentation.dto.UploadCourseDocumentDto;
import com.knowted.KnowtedBackend.application.usecase.CourseDocumentUseCase;
import com.knowted.KnowtedBackend.application.usecase.GCSStorageServiceUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class CourseDocumentController {

    private final CourseDocumentUseCase courseDocumentUseCase;
    private final GCSStorageServiceUseCase gcsStorageServiceUseCase;

    // ────────────────────────────────────────────────
    // GET /api/documents  (Document Bank – all user documents)
    // ────────────────────────────────────────────────

    @Operation(summary = "List all user documents", description = "Returns all documents across every course for the authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Documents retrieved")
    })
    @GetMapping("/documents")
    public List<DocumentBankItemDto> listAllDocuments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID courseId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return courseDocumentUseCase.listAllUserDocuments(userId, search, courseId);
    }

    // ────────────────────────────────────────────────
    // GET /api/courses/{courseId}/documents
    // ────────────────────────────────────────────────

    @Operation(summary = "List documents in a course", description = "Paginated list of document metadata")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Documents retrieved"),
            @ApiResponse(responseCode = "403", description = "Not authorized"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping("/courses/{courseId}/documents")
    public List<CourseDocumentResponseDto> listCourseDocuments(
            @PathVariable UUID courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt) {

        UUID requesterId = UUID.fromString(jwt.getSubject());
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());

        return courseDocumentUseCase.listByCourse(courseId, pageable, requesterId);
    }

    // ────────────────────────────────────────────────
    // POST /api/courses/{courseId}/documents
    // ────────────────────────────────────────────────

    @Operation(summary = "Upload a document to a course", description = "Uploads file and creates CourseDocument record")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or request"),
            @ApiResponse(responseCode = "403", description = "Not authorized"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PostMapping(value = "/courses/{courseId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDocumentResponseDto uploadDocument(
            @PathVariable UUID courseId,
            @RequestPart("file") @Valid MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {

        UUID studentId = UUID.fromString(jwt.getSubject());

        UploadCourseDocumentDto cmd = UploadCourseDocumentDto.builder()
                .courseId(courseId)
                .file(file)
                .studentId(studentId)
                .build();

        return gcsStorageServiceUseCase.execute(cmd);
    }

    // ────────────────────────────────────────────────
    // GET /api/documents/{documentId}
    // ────────────────────────────────────────────────

    @Operation(summary = "Get document metadata", description = "Returns metadata for a single document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document metadata"),
            @ApiResponse(responseCode = "403", description = "Not authorized"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/documents/{documentId}")
    public CourseDocumentResponseDto getDocument(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID requesterId = UUID.fromString(jwt.getSubject());
        return courseDocumentUseCase.getDocument(documentId, requesterId);
    }

    // ────────────────────────────────────────────────
    // GET /api/documents/{documentId}/presigned-url
    // ────────────────────────────────────────────────

    @Operation(summary = "Get presigned URL", description = "Returns a temporary signed URL to view/download the file")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Presigned URL generated"),
            @ApiResponse(responseCode = "403", description = "Not authorized"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/documents/{documentId}/presigned-url")
    public DownloadUrlResponse getPresignedUrl(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "3600") long expirySeconds) {

        UUID requesterId = UUID.fromString(jwt.getSubject());
        Duration expiry = Duration.ofSeconds(expirySeconds);

        return courseDocumentUseCase.getPresignedUrl(documentId, requesterId, expiry);
    }

    // ────────────────────────────────────────────────
    // DELETE /api/documents/{documentId}
    // ────────────────────────────────────────────────

    @Operation(summary = "Delete a document", description = "Deletes document metadata from DB and file from GCS")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Document deleted"),
            @ApiResponse(responseCode = "403", description = "Not authorized"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID deleterId = UUID.fromString(jwt.getSubject());
        courseDocumentUseCase.deleteDocument(documentId, deleterId);
    }
}