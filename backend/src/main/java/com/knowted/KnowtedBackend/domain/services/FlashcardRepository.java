package com.knowted.KnowtedBackend.domain.services;

import com.knowted.KnowtedBackend.domain.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {

    List<Flashcard> findByDeck_StudyAidIdOrderByDisplayOrderAsc(UUID deckId);
}
