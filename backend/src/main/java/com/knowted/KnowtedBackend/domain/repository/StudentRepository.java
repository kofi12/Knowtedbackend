package com.knowted.KnowtedBackend.domain.repository;


import com.knowted.KnowtedBackend.domain.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByProviderUserIdAndAuthProvider(String providerUserId, String authProvider);

    Optional<Student> findByProviderUserId(String providerUserId);

    boolean existsByEmail(String email);
}