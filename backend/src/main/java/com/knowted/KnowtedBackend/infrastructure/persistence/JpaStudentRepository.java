package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;

import java.util.Optional;

public class JpaStudentRepository implements StudentRepository {
    @Override
    public Optional<Student> findByProviderUserIdAndAuthProvider(String providerUserId, String authProvider) {
        return Optional.empty();
    }

    @Override
    public Optional<Student> findByProviderUserId(String providerUserId) {
        return Optional.empty();
    }

    @Override
    public boolean existsByEmail(String email) {
        return false;
    }
}
