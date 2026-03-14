package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.exception.StudentNotFoundException;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import com.knowted.KnowtedBackend.presentation.dto.StudentResponseDto;
import com.knowted.KnowtedBackend.presentation.mapper.StudentMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentUseCaseTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentMapper studentMapper;

    @InjectMocks
    private StudentUseCase studentUseCase;

    @Test
    void getAllStudents_returnsMappedList() {
        Student s1 = Student.createFromGoogle("sub1", "a@x.com", "User A");
        Student s2 = Student.createFromGoogle("sub2", "b@x.com", "User B");
        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));

        StudentResponseDto dto1 = new StudentResponseDto(null, "a@x.com", "User A");
        StudentResponseDto dto2 = new StudentResponseDto(null, "b@x.com", "User B");
        when(studentMapper.toResponseDto(s1)).thenReturn(dto1);
        when(studentMapper.toResponseDto(s2)).thenReturn(dto2);

        List<StudentResponseDto> result = studentUseCase.getAllStudents();

        assertThat(result).hasSize(2).containsExactly(dto1, dto2);
        verify(studentRepository).findAll();
    }

    @Test
    void getAllStudents_returnsEmptyWhenNoStudents() {
        when(studentRepository.findAll()).thenReturn(List.of());

        List<StudentResponseDto> result = studentUseCase.getAllStudents();

        assertThat(result).isEmpty();
    }

    @Test
    void getStudentById_returnsMappedStudent() {
        UUID id = UUID.randomUUID();
        Student student = Student.createFromGoogle("sub", "u@x.com", "User");
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));

        StudentResponseDto dto = new StudentResponseDto(id, "u@x.com", "User");
        when(studentMapper.toResponseDto(student)).thenReturn(dto);

        StudentResponseDto result = studentUseCase.getStudentById(id);

        assertThat(result).isEqualTo(dto);
        verify(studentRepository).findById(id);
    }

    @Test
    void getStudentById_throwsStudentNotFoundExceptionWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(studentRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentUseCase.getStudentById(id))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining(id.toString());
    }
}
