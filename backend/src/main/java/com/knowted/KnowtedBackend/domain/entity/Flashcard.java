package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "flashcards")
@SuppressWarnings("unused")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flashcard_id")
    private Long flashcardId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private FlashcardDeck deck;

    @Column(name = "front_text", nullable = false)
    private String frontText;

    @Column(name = "back_text", nullable = false)
    private String backText;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    protected Flashcard() {}

    public Flashcard(String frontText, String backText, int orderIndex) {
        this.frontText = frontText;
        this.backText = backText;
        this.orderIndex = orderIndex;
    }

    public Long getFlashcardId() { return flashcardId; }
    public FlashcardDeck getDeck() { return deck; }
    public String getFrontText() { return frontText; }
    public String getBackText() { return backText; }
    public int getOrderIndex() { return orderIndex; }
    public Instant getCreatedAt() { return createdAt; }

    void setDeck(FlashcardDeck deck) { this.deck = deck; }
}
