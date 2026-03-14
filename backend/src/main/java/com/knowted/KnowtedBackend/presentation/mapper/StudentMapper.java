package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import org.springframework.stereotype.Component;

@Component
@SuppressWarnings("unused")
public class StudentMapper {

    public StudentResponseDto toResponseDto(Student student) {
        return new StudentResponseDto(
                student.getStudentId(),
                student.getEmail(),
                student.getDisplayName()
        );
    }
}