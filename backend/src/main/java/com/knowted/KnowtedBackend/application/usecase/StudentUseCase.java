package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StudentUseCase {

    private final StudentRepository studentRepository;

    public StudentUseCase(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public Optional<StudentResponseDto> getStudentById(UUID id) {
        return studentRepository.findById(id)
                .map(this::toResponseDto);
    }

    private StudentResponseDto toResponseDto(Student student) {
        return new StudentResponseDto(
                student.getStudentId(),
                student.getEmail(),
                student.getDisplayName()
        );
    }
}