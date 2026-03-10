package com.knowted.KnowtedBackend.presentation.controllers;


import com.knowted.KnowtedBackend.application.usecase.StudentUseCase;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentUseCase studentUseCase;

    public StudentController(StudentUseCase studentUseCase) {
        this.studentUseCase = studentUseCase;
    }

    @GetMapping
    public List<StudentResponseDto> getAllStudents() {
        return studentUseCase.getAllStudents();
    }

    @GetMapping("/{id}")
    public StudentResponseDto getStudentById(@PathVariable UUID id) {
        return studentUseCase.getStudentById(id);
    }
}