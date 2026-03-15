package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "flashcards",
    uniqueConstraints = @UniqueConstraint(columnNames = {"deck_id", "display_order"})
)
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "flashcard_id")
    private UUID flashcardId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private StudyAid deck;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Flashcard() {}

    public Flashcard(StudyAid deck, String questionText, String answerText, int displayOrder) {
        this.deck = deck;
        this.questionText = questionText;
        this.answerText = answerText;
        this.displayOrder = displayOrder;
    }

    public UUID getFlashcardId()  { return flashcardId; }
    public StudyAid getDeck()     { return deck; }
    public String getQuestionText(){ return questionText; }
    public String getAnswerText() { return answerText; }
    public int getDisplayOrder()  { return displayOrder; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setDeck(StudyAid deck)           { this.deck = deck; }
    public void setQuestionText(String q)        { this.questionText = q; }
    public void setAnswerText(String a)          { this.answerText = a; }
    public void setDisplayOrder(int displayOrder){ this.displayOrder = displayOrder; }
}
