package com.knowted.KnowtedBackend.infrastructure.auth;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentUserDetailsServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentUserDetailsService studentUserDetailsService;

    @Test
    void loadUserByUsername_found_returnsUserDetails() {
        UUID id = UUID.randomUUID();
        Student student = Student.createFromGoogle("sub", "u@x.com", "User");
        org.springframework.test.util.ReflectionTestUtils.setField(student, "studentId", id);
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));

        UserDetails details = studentUserDetailsService.loadUserByUsername(id.toString());

        assertThat(details).isNotNull();
        assertThat(details.getUsername()).isEqualTo(id.toString());
        assertThat(details.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
    }

    @Test
    void loadUserByUsername_notFound_throwsUsernameNotFoundException() {
        UUID id = UUID.randomUUID();
        when(studentRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentUserDetailsService.loadUserByUsername(id.toString()))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    @Test
    void loadUserByUsername_invalidUuid_throwsException() {
        assertThatThrownBy(() -> studentUserDetailsService.loadUserByUsername("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
