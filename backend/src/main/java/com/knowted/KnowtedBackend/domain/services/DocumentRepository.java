package com.knowted.KnowtedBackend.domain.services;

import com.knowted.KnowtedBackend.domain.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByUser_UserId(UUID userId);
}
