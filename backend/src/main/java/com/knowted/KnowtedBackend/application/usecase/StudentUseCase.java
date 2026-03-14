package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import com.knowted.KnowtedBackend.domain.exception.StudentNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import com.knowted.KnowtedBackend.presentation.mapper.StudentMapper;

@Service
@SuppressWarnings("unused")
public class StudentUseCase {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentUseCase(StudentRepository studentRepository, StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
    }
    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(studentMapper::toResponseDto)
                .toList();
    }

    public StudentResponseDto getStudentById(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));

        return studentMapper.toResponseDto(student);
    }

}