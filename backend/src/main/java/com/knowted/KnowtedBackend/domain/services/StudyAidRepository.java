package com.knowted.KnowtedBackend.domain.services;

import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyAidRepository extends JpaRepository<StudyAid, UUID> {

    // All active (non-deleted) flashcard decks for a user
    List<StudyAid> findByUserIdAndTypeCodeAndDeletedAtIsNull(UUID userId, String typeCode);

    // Find a specific study aid belonging to a user (guards against cross-user access)
    Optional<StudyAid> findByStudyAidIdAndUserIdAndDeletedAtIsNull(UUID studyAidId, UUID userId);
}
