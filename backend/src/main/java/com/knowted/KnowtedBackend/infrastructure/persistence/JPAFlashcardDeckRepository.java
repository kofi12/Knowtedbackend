package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface JPAFlashcardDeckRepository extends JpaRepository<FlashcardDeck, UUID> {

    @Query("SELECT d FROM FlashcardDeck d LEFT JOIN FETCH d.flashcards WHERE d.deckId = :deckId")
    Optional<FlashcardDeck> findByIdWithFlashcards(@Param("deckId") UUID deckId);
}
