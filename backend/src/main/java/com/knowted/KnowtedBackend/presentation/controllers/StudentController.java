package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import com.knowted.KnowtedBackend.domain.exception.StudentNotFoundException;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import com.knowted.KnowtedBackend.presentation.mapper.StudentMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    @Operation(summary = "Get current authenticated student's profile", description = "Returns basic profile information for the logged-in user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Current student profile"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/me")
    public ResponseEntity<StudentResponseDto> getCurrentStudent(
            @AuthenticationPrincipal Jwt jwt) {

        // 1. Extract student ID from JWT subject
        String subject = jwt.getSubject();
        UUID studentId;
        try {
            studentId = UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid JWT subject format");
        }

        // 2. Load student from database
        Student student = studentRepository.findById(studentId)
                .orElseThrow();

        // 3. Map to DTO
        StudentResponseDto dto = studentMapper.toResponseDto(student);

        return ResponseEntity.ok(dto);
    }
}