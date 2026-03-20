package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JPAFlashcardRepository extends JpaRepository<Flashcard, Long> {
}
