package com.knowted.KnowtedBackend.infrastructure.auth;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@SuppressWarnings("unused")
public class StudentUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public StudentUserDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UUID studentId = UUID.fromString(username);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                student.getStudentId().toString(),
                "",  // no password for JWT-based auth
                AuthorityUtils.createAuthorityList("ROLE_STUDENT")  // or load from entity later
        );
    }
}