package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "flashcard_decks")
@SuppressWarnings("unused")
public class FlashcardDeck {

    // deck_id is the same as the study_aid_id it references
    @Id
    @Column(name = "deck_id")
    private UUID deckId;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Flashcard> flashcards = new ArrayList<>();

    protected FlashcardDeck() {}

    public FlashcardDeck(UUID deckId) {
        this.deckId = deckId;
    }

    public UUID getDeckId() { return deckId; }
    public List<Flashcard> getFlashcards() { return flashcards; }

    public void addFlashcard(Flashcard card) {
        flashcards.add(card);
        card.setDeck(this);
    }
}
