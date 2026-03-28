package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.*;
import com.knowted.KnowtedBackend.domain.exception.AccessDeniedException;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.exception.DocumentNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.*;
import com.knowted.KnowtedBackend.presentation.dto.FlashcardDeckResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashcardUseCaseTest {

    @Mock private JPACourseRepository courseRepository;
    @Mock private JPACourseDocumentRepository documentRepository;
    @Mock private JPAStudyAidRepository studyAidRepository;
    @Mock private JPAFlashcardDeckRepository deckRepository;
    @Mock private JPAFlashcardRepository flashcardRepository;
    @Mock private StorageService storageService;
    @Mock private GCSStorageServiceUseCase gcsStorageServiceUseCase;

    private FlashcardUseCase flashcardUseCase;

    private final UUID userId   = UUID.randomUUID();
    private final UUID otherId  = UUID.randomUUID();
    private final UUID courseId = UUID.randomUUID();
    private final UUID deckId   = UUID.randomUUID();
    private final UUID documentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        flashcardUseCase = new FlashcardUseCase(
                courseRepository, documentRepository, studyAidRepository,
                deckRepository, flashcardRepository, storageService,
                gcsStorageServiceUseCase,
                "test-api-key", "gpt-4o-mini"
        );
    }

    // ─────────────────────────────────────────────────────────
    // generateFlashcards — pre-AI guard tests
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateFlashcards")
    class GenerateFlashcards {

        @Test
        @DisplayName("TC-FL-001 - throws CourseNotFoundException when course not owned by user")
        void generateFlashcards_courseNotFound_throws() {
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    flashcardUseCase.generateFlashcards(userId, courseId, null, documentId, null))
                    .isInstanceOf(CourseNotFoundException.class)
                    .hasMessageContaining(courseId.toString());
        }

        @Test
        @DisplayName("TC-FL-001 - throws DocumentNotFoundException when documentId resolves nothing")
        void generateFlashcards_documentNotFound_throws() {
            Course course = new Course(userId, "CS1", "Intro", "F25");
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    flashcardUseCase.generateFlashcards(userId, courseId, null, documentId, null))
                    .isInstanceOf(DocumentNotFoundException.class)
                    .hasMessageContaining(documentId.toString());
        }

        @Test
        @DisplayName("TC-FL-001 - throws IllegalArgumentException when neither file nor documentId is provided")
        void generateFlashcards_noFileNorDocumentId_throws() {
            Course course = new Course(userId, "CS1", "Intro", "F25");
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));

            // Both file=null and documentId=null
            assertThatThrownBy(() ->
                    flashcardUseCase.generateFlashcards(userId, courseId, null, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("documentId");
        }
    }

    // ─────────────────────────────────────────────────────────
    // getDeck
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getDeck")
    class GetDeck {

        @Test
        @DisplayName("TC-FL-010 - returns FlashcardDeckResponseDto for valid owner")
        void getDeck_found_returnsDto() {
            FlashcardDeck deck = deckWithCards(deckId, 3);
            StudyAid aid = studyAid(deckId, userId);

            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.of(deck));
            when(studyAidRepository.findByIdWithCourse(deckId)).thenReturn(Optional.of(aid));

            FlashcardDeckResponseDto result = flashcardUseCase.getDeck(userId, deckId);

            assertThat(result.deckId()).isEqualTo(deckId);
            assertThat(result.generationStatus()).isEqualTo("DONE");
            assertThat(result.flashcards()).hasSize(3);
        }

        @Test
        @DisplayName("TC-FL-012 - throws when deck does not exist")
        void getDeck_notFound_throws() {
            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flashcardUseCase.getDeck(userId, deckId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining(deckId.toString());
        }

        @Test
        @DisplayName("TC-FL-011 - throws AccessDeniedException when requester does not own the deck")
        void getDeck_wrongUser_throwsAccessDenied() {
            FlashcardDeck deck = deckWithCards(deckId, 1);
            StudyAid aid = studyAid(deckId, otherId); // owned by someone else

            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.of(deck));
            when(studyAidRepository.findByIdWithCourse(deckId)).thenReturn(Optional.of(aid));

            assertThatThrownBy(() -> flashcardUseCase.getDeck(userId, deckId))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("TC-FL-010 - flashcards are included in the response")
        void getDeck_flashcardsPopulated() {
            FlashcardDeck deck = deckWithCards(deckId, 10);
            StudyAid aid = studyAid(deckId, userId);

            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.of(deck));
            when(studyAidRepository.findByIdWithCourse(deckId)).thenReturn(Optional.of(aid));

            FlashcardDeckResponseDto result = flashcardUseCase.getDeck(userId, deckId);

            assertThat(result.flashcards()).hasSize(10);
            result.flashcards().forEach(card -> {
                assertThat(card.frontText()).isNotBlank();
                assertThat(card.backText()).isNotBlank();
            });
        }
    }

    // ─────────────────────────────────────────────────────────
    // listDecks
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listDecks")
    class ListDecks {

        @Test
        @DisplayName("TC-FL-007 - returns all decks for owned course")
        void listDecks_returnsDeckList() {
            Course course = new Course(userId, "C1", "Name", null);
            StudyAid aid = studyAid(deckId, userId);
            FlashcardDeck deck = deckWithCards(deckId, 2);

            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, (short) 1))
                    .thenReturn(List.of(aid));
            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.of(deck));

            List<FlashcardDeckResponseDto> result = flashcardUseCase.listDecks(userId, courseId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).deckId()).isEqualTo(deckId);
        }

        @Test
        @DisplayName("TC-FL-008 - returns empty list when course has no decks")
        void listDecks_noneExist_returnsEmpty() {
            Course course = new Course(userId, "C1", "Name", null);
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, (short) 1))
                    .thenReturn(Collections.emptyList());

            List<FlashcardDeckResponseDto> result = flashcardUseCase.listDecks(userId, courseId);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("TC-FL-009 - throws CourseNotFoundException when course not owned by user")
        void listDecks_courseNotFound_throws() {
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flashcardUseCase.listDecks(userId, courseId))
                    .isInstanceOf(CourseNotFoundException.class);
        }

        @Test
        @DisplayName("TC-FL-007 - study aids without a matching deck are silently filtered out")
        void listDecks_missingDeckEntity_isFiltered() {
            Course course = new Course(userId, "C1", "Name", null);
            StudyAid aid = studyAid(deckId, userId);

            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, (short) 1))
                    .thenReturn(List.of(aid));
            // No FlashcardDeck entity for this study aid
            when(deckRepository.findByIdWithFlashcards(deckId)).thenReturn(Optional.empty());

            List<FlashcardDeckResponseDto> result = flashcardUseCase.listDecks(userId, courseId);

            assertThat(result).isEmpty();
        }
    }

    // ─────────────────────────────────────────────────────────
    // deleteDeck
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteDeck")
    class DeleteDeck {

        @Test
        @DisplayName("TC-FL-013 - owner can delete deck; both repo deletes are called")
        void deleteDeck_owner_deletesDeckAndStudyAid() {
            StudyAid aid = studyAid(deckId, userId);
            when(studyAidRepository.findById(deckId)).thenReturn(Optional.of(aid));

            flashcardUseCase.deleteDeck(userId, deckId);

            verify(deckRepository).deleteById(deckId);
            verify(studyAidRepository).deleteById(deckId);
        }

        @Test
        @DisplayName("TC-FL-014 - throws AccessDeniedException when requester does not own the deck")
        void deleteDeck_wrongUser_throwsAccessDenied() {
            StudyAid aid = studyAid(deckId, otherId);
            when(studyAidRepository.findById(deckId)).thenReturn(Optional.of(aid));

            assertThatThrownBy(() -> flashcardUseCase.deleteDeck(userId, deckId))
                    .isInstanceOf(AccessDeniedException.class);

            verify(deckRepository, never()).deleteById(any());
            verify(studyAidRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("TC-FL-013 - throws when study aid does not exist")
        void deleteDeck_notFound_throws() {
            when(studyAidRepository.findById(deckId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> flashcardUseCase.deleteDeck(userId, deckId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining(deckId.toString());
        }
    }

    // ─────────────────────────────────────────────────────────
    // Test data helpers
    // ─────────────────────────────────────────────────────────

    private StudyAid studyAid(UUID id, UUID owner) {
        StudyAid aid = StudyAid.create(owner, null, documentId, (short) 1, "Test Deck");
        ReflectionTestUtils.setField(aid, "studyAidId", id);
        ReflectionTestUtils.setField(aid, "generationStatus", "DONE");
        return aid;
    }

    private FlashcardDeck deckWithCards(UUID id, int cardCount) {
        FlashcardDeck deck = new FlashcardDeck(id);
        for (int i = 0; i < cardCount; i++) {
            Flashcard card = new Flashcard("Front " + i, "Back " + i, i);
            ReflectionTestUtils.setField(card, "flashcardId", (long) i);
            deck.addFlashcard(card);
        }
        return deck;
    }
}
