package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Flashcard;
import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckDto;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckSummaryDto;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FlashcardMapper {

    public FlashcardDto toDto(Flashcard card) {
        return new FlashcardDto(
                card.getFlashcardId(),
                card.getQuestionText(),
                card.getAnswerText(),
                card.getDisplayOrder(),
                card.getCreatedAt()
        );
    }

    public FlashcardDeckDto toDeckDto(StudyAid deck) {
        List<FlashcardDto> cards = deck.getFlashcards()
                .stream()
                .map(this::toDto)
                .toList();

        return new FlashcardDeckDto(
                deck.getStudyAidId(),
                deck.getTitle(),
                deck.getCreatedAt(),
                deck.getUpdatedAt(),
                cards
        );
    }

    public FlashcardDeckSummaryDto toSummaryDto(StudyAid deck) {
        return new FlashcardDeckSummaryDto(
                deck.getStudyAidId(),
                deck.getTitle(),
                deck.getFlashcards().size(),
                deck.getCreatedAt()
        );
    }
}
