package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "study_aids")
public class StudyAid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "study_aid_id")
    private UUID studyAidId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // "FLASHCARD_DECK" or "QUIZ"
    @Column(name = "type_code", nullable = false)
    private String typeCode;

    @Column(name = "title", nullable = false)
    private String title;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<Flashcard> flashcards = new ArrayList<>();

    protected StudyAid() {}

    public StudyAid(UUID userId, String typeCode, String title) {
        this.userId = userId;
        this.typeCode = typeCode;
        this.title = title;
    }

    public UUID getStudyAidId()  { return studyAidId; }
    public UUID getUserId()      { return userId; }
    public String getTypeCode()  { return typeCode; }
    public String getTitle()     { return title; }
    public Instant getCreatedAt(){ return createdAt; }
    public Instant getUpdatedAt(){ return updatedAt; }
    public Instant getDeletedAt(){ return deletedAt; }
    public List<Flashcard> getFlashcards() { return flashcards; }

    public void setTitle(String title) { this.title = title; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

    public void addFlashcard(Flashcard card) {
        flashcards.add(card);
        card.setDeck(this);
    }
}
