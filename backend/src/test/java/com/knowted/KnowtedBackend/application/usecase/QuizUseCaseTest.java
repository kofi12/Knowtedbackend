package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.*;
import com.knowted.KnowtedBackend.domain.exception.AccessDeniedException;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.exception.DocumentNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.*;
import com.knowted.KnowtedBackend.presentation.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizUseCaseTest {

    @Mock private JPACourseRepository courseRepository;
    @Mock private JPACourseDocumentRepository documentRepository;
    @Mock private JPAStudyAidRepository studyAidRepository;
    @Mock private JPAQuizRepository quizRepository;
    @Mock private JPAQuizAttemptRepository attemptRepository;
    @Mock private StorageService storageService;

    private QuizUseCase quizUseCase;

    private final UUID userId  = UUID.randomUUID();
    private final UUID otherId = UUID.randomUUID();
    private final UUID courseId  = UUID.randomUUID();
    private final UUID quizId    = UUID.randomUUID();
    private final UUID documentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // Construct manually so that the @Value String fields are supplied directly
        // and the RestClient / Tika instances are created internally (not tested here).
        quizUseCase = new QuizUseCase(
                courseRepository, documentRepository, studyAidRepository,
                quizRepository, attemptRepository, storageService,
                "test-api-key", "gpt-4o-mini"
        );
    }

    // ─────────────────────────────────────────────────────────
    // generateQuiz — pre-AI guard tests
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateQuiz")
    class GenerateQuiz {

        @Test
        @DisplayName("TC-QZ-001 - throws CourseNotFoundException when course does not belong to user")
        void generateQuiz_courseNotFound_throws() {
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.generateQuiz(userId, courseId, documentId, "MCQ", null))
                    .isInstanceOf(CourseNotFoundException.class)
                    .hasMessageContaining(courseId.toString());
        }

        @Test
        @DisplayName("TC-QZ-001 - throws DocumentNotFoundException when document does not exist")
        void generateQuiz_documentNotFound_throws() {
            Course course = new Course(userId, "CS101", "Algorithms", "F25");
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.generateQuiz(userId, courseId, documentId, "MCQ", null))
                    .isInstanceOf(DocumentNotFoundException.class)
                    .hasMessageContaining(documentId.toString());
        }
    }

    // ─────────────────────────────────────────────────────────
    // getQuiz
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getQuiz")
    class GetQuiz {

        @Test
        @DisplayName("TC-QZ-009 - returns QuizResponseDto for valid owner")
        void getQuiz_found_returnsDto() {
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findByIdWithCourse(quizId)).thenReturn(Optional.of(aid));

            QuizResponseDto result = quizUseCase.getQuiz(userId, quizId);

            assertThat(result.quizId()).isEqualTo(quizId);
            assertThat(result.generationStatus()).isEqualTo("DONE");
            assertThat(result.questions()).hasSize(1);
        }

        @Test
        @DisplayName("TC-QZ-012 - throws when quiz does not exist")
        void getQuiz_notFound_throws() {
            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.getQuiz(userId, quizId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining(quizId.toString());
        }

        @Test
        @DisplayName("TC-QZ-011 - throws AccessDeniedException when requester does not own the quiz")
        void getQuiz_wrongUser_throwsAccessDenied() {
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");
            StudyAid aid = studyAid(quizId, otherId); // owned by someone else

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findByIdWithCourse(quizId)).thenReturn(Optional.of(aid));

            assertThatThrownBy(() -> quizUseCase.getQuiz(userId, quizId))
                    .isInstanceOf(AccessDeniedException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // listQuizzes
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listQuizzes")
    class ListQuizzes {

        @Test
        @DisplayName("TC-QZ-006 - returns dto list for owned course")
        void listQuizzes_returnsList() {
            Course course = new Course(userId, "C1", "Name", null);
            StudyAid aid = studyAid(quizId, userId);
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");

            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, (short) 2))
                    .thenReturn(List.of(aid));
            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));

            List<QuizResponseDto> result = quizUseCase.listQuizzes(userId, courseId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).quizId()).isEqualTo(quizId);
        }

        @Test
        @DisplayName("TC-QZ-007 - returns empty list when course has no quizzes")
        void listQuizzes_noneExist_returnsEmpty() {
            Course course = new Course(userId, "C1", "Name", null);
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(course));
            when(studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, (short) 2))
                    .thenReturn(Collections.emptyList());

            List<QuizResponseDto> result = quizUseCase.listQuizzes(userId, courseId);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("TC-QZ-008 - throws CourseNotFoundException when course not owned by user")
        void listQuizzes_courseNotFound_throws() {
            when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.listQuizzes(userId, courseId))
                    .isInstanceOf(CourseNotFoundException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // submitAttempt — grading logic
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("submitAttempt")
    class SubmitAttempt {

        @Test
        @DisplayName("TC-QZA-001 - MCQ all correct answers yields 100%")
        void submitAttempt_mcq_allCorrect_returns100() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // Select the correct option for each question
            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(1L, List.of(10L)); // Q1 correct = option 10
            answers.put(2L, List.of(20L)); // Q2 correct = option 20
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(result.totalPoints()).isEqualTo(2);
            assertThat(result.answers()).hasSize(2);
            assertThat(result.answers()).allMatch(AttemptAnswerDto::isCorrect);
        }

        @Test
        @DisplayName("TC-QZA-001 - MCQ all wrong answers yields 0%")
        void submitAttempt_mcq_allWrong_returns0() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // Select incorrect options
            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(1L, List.of(11L)); // Q1 wrong = option 11
            answers.put(2L, List.of(21L)); // Q2 wrong = option 21
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.answers()).noneMatch(AttemptAnswerDto::isCorrect);
        }

        @Test
        @DisplayName("TC-QZA-001 - MCQ 1 of 2 correct yields 50%")
        void submitAttempt_mcq_halfCorrect_returns50() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(1L, List.of(10L)); // Q1 correct
            answers.put(2L, List.of(21L)); // Q2 wrong
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(new BigDecimal("50.00"));
        }

        @Test
        @DisplayName("TC-QZA-004 - MCQ_MULTI partial option selection is graded incorrect")
        void submitAttempt_mcqMulti_partialSelection_isWrong() {
            Quiz quiz = mcqMultiQuiz(); // one question with options 30L(correct), 31L(correct), 32L(wrong)
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // Only select 1 of 2 correct options
            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(3L, List.of(30L)); // missing 31L
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.answers()).noneMatch(AttemptAnswerDto::isCorrect);
        }

        @Test
        @DisplayName("TC-QZA-005 - MCQ_MULTI exact correct option set is graded correct")
        void submitAttempt_mcqMulti_exactSelection_isCorrect() {
            Quiz quiz = mcqMultiQuiz(); // one question with options 30L(correct), 31L(correct), 32L(wrong)
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // Select exactly the two correct options
            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(3L, List.of(30L, 31L));
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(new BigDecimal("100.00"));
        }

        @Test
        @DisplayName("TC-QZA-001 - MCQ no answer submitted for a question counts as wrong")
        void submitAttempt_mcq_noAnswer_countedAsWrong() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            // Empty answers map — no options selected for any question
            SubmitQuizRequest request = new SubmitQuizRequest(Map.of());

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            assertThat(result.score()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("TC-QZA-002 - answer snapshots store question and option text at submission time")
        void submitAttempt_snapshotsAreStored() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            Map<Long, List<Long>> answers = new HashMap<>();
            answers.put(1L, List.of(10L));
            answers.put(2L, List.of(20L));
            SubmitQuizRequest request = new SubmitQuizRequest(answers);

            QuizAttemptResponseDto result = quizUseCase.submitAttempt(userId, quizId, request);

            // Both answers should carry non-null text snapshots
            result.answers().forEach(a -> {
                assertThat(a.questionTextSnapshot()).isNotBlank();
                assertThat(a.selectedOptionTextSnapshot()).isNotBlank();
            });
        }

        @Test
        @DisplayName("TC-QZA-001 - throws AccessDeniedException when requester does not own the quiz")
        void submitAttempt_wrongUser_throwsAccessDenied() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, otherId); // owned by someone else

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));

            SubmitQuizRequest request = new SubmitQuizRequest(Map.of());

            assertThatThrownBy(() -> quizUseCase.submitAttempt(userId, quizId, request))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("TC-QZA-001 - throws when quiz does not exist")
        void submitAttempt_quizNotFound_throws() {
            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.submitAttempt(userId, quizId, new SubmitQuizRequest(Map.of())))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("TC-QZA-001 - attempt is saved with score and totalPoints populated")
        void submitAttempt_savedAttemptHasScoreAndTotalPoints() {
            Quiz quiz = mcqQuizWith2Questions();
            StudyAid aid = studyAid(quizId, userId);

            when(quizRepository.findByIdWithQuestionsAndOptions(quizId)).thenReturn(Optional.of(quiz));
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));
            when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(inv -> inv.getArgument(0));

            Map<Long, List<Long>> answers = Map.of(1L, List.of(10L), 2L, List.of(20L));
            quizUseCase.submitAttempt(userId, quizId, new SubmitQuizRequest(answers));

            verify(attemptRepository).save(argThat(attempt ->
                    attempt.getScore() != null &&
                    attempt.getTotalPoints() != null &&
                    attempt.getCompletedAt() != null
            ));
        }
    }

    // ─────────────────────────────────────────────────────────
    // listAttempts
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listAttempts")
    class ListAttempts {

        @Test
        @DisplayName("TC-QZA-003 - delegates to repo and maps results")
        void listAttempts_delegatesToRepo() {
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");
            QuizAttempt attempt = new QuizAttempt(userId, quiz);
            ReflectionTestUtils.setField(attempt, "attemptId", 1L);

            when(attemptRepository.findByQuiz_QuizIdAndUserIdOrderByStartedAtDesc(quizId, userId))
                    .thenReturn(List.of(attempt));

            List<QuizAttemptResponseDto> result = quizUseCase.listAttempts(userId, quizId);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("TC-QZA-008 - returns empty list when user has no attempts")
        void listAttempts_noneExist_returnsEmpty() {
            when(attemptRepository.findByQuiz_QuizIdAndUserIdOrderByStartedAtDesc(quizId, userId))
                    .thenReturn(Collections.emptyList());

            List<QuizAttemptResponseDto> result = quizUseCase.listAttempts(userId, quizId);

            assertThat(result).isEmpty();
        }
    }

    // ─────────────────────────────────────────────────────────
    // getAttempt
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAttempt")
    class GetAttempt {

        @Test
        @DisplayName("TC-QZA-010 - returns full attempt DTO for owner")
        void getAttempt_found_returnsDto() {
            Long attemptId = 42L;
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");
            QuizAttempt attempt = new QuizAttempt(userId, quiz);
            ReflectionTestUtils.setField(attempt, "attemptId", attemptId);

            when(attemptRepository.findByIdWithAnswers(attemptId)).thenReturn(Optional.of(attempt));

            QuizAttemptResponseDto result = quizUseCase.getAttempt(userId, attemptId);

            assertThat(result.attemptId()).isEqualTo(attemptId);
        }

        @Test
        @DisplayName("TC-QZA-012 - throws when attempt does not exist")
        void getAttempt_notFound_throws() {
            when(attemptRepository.findByIdWithAnswers(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.getAttempt(userId, 99L))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("TC-QZA-011 - throws AccessDeniedException when requester is not the attempt owner")
        void getAttempt_wrongUser_throwsAccessDenied() {
            Quiz quiz = quizWithOneQuestion(quizId, "MCQ");
            QuizAttempt attempt = new QuizAttempt(otherId, quiz); // owned by someone else
            ReflectionTestUtils.setField(attempt, "attemptId", 1L);

            when(attemptRepository.findByIdWithAnswers(1L)).thenReturn(Optional.of(attempt));

            assertThatThrownBy(() -> quizUseCase.getAttempt(userId, 1L))
                    .isInstanceOf(AccessDeniedException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // deleteQuiz
    // ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteQuiz")
    class DeleteQuiz {

        @Test
        @DisplayName("TC-QZ-013 - owner can delete quiz; both repo deletes are called")
        void deleteQuiz_owner_deletesStudyAidAndQuiz() {
            StudyAid aid = studyAid(quizId, userId);
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));

            quizUseCase.deleteQuiz(userId, quizId);

            verify(quizRepository).deleteById(quizId);
            verify(studyAidRepository).deleteById(quizId);
        }

        @Test
        @DisplayName("TC-QZ-014 - throws AccessDeniedException when requester does not own the quiz")
        void deleteQuiz_wrongUser_throwsAccessDenied() {
            StudyAid aid = studyAid(quizId, otherId);
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.of(aid));

            assertThatThrownBy(() -> quizUseCase.deleteQuiz(userId, quizId))
                    .isInstanceOf(AccessDeniedException.class);

            verify(quizRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("TC-QZ-012 - throws when study aid does not exist")
        void deleteQuiz_notFound_throws() {
            when(studyAidRepository.findById(quizId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quizUseCase.deleteQuiz(userId, quizId))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ─────────────────────────────────────────────────────────
    // Test data helpers
    // ─────────────────────────────────────────────────────────

    /** Creates a StudyAid owned by the given user, with the given ID set via reflection. */
    private StudyAid studyAid(UUID id, UUID owner) {
        StudyAid aid = StudyAid.create(owner, null, documentId, (short) 2, "Test Quiz");
        ReflectionTestUtils.setField(aid, "studyAidId", id);
        ReflectionTestUtils.setField(aid, "generationStatus", "DONE");
        return aid;
    }

    /**
     * A Quiz with 1 MCQ question (questionId=1), 2 options:
     *   option 10 = correct, option 11 = wrong
     */
    private Quiz quizWithOneQuestion(UUID id, String type) {
        Quiz quiz = new Quiz(id);
        QuizQuestion q = new QuizQuestion("What is X?", type, 0);
        ReflectionTestUtils.setField(q, "questionId", 1L);

        QuestionOption correct = new QuestionOption("Correct answer", true, 0);
        ReflectionTestUtils.setField(correct, "optionId", 10L);
        QuestionOption wrong = new QuestionOption("Wrong answer", false, 1);
        ReflectionTestUtils.setField(wrong, "optionId", 11L);

        q.addOption(correct);
        q.addOption(wrong);
        quiz.addQuestion(q);
        return quiz;
    }

    /**
     * A Quiz with 2 MCQ questions:
     *   Q1 (id=1): option 10=correct, option 11=wrong
     *   Q2 (id=2): option 20=correct, option 21=wrong
     */
    private Quiz mcqQuizWith2Questions() {
        Quiz quiz = new Quiz(quizId);

        QuizQuestion q1 = new QuizQuestion("Q1?", "MCQ", 0);
        ReflectionTestUtils.setField(q1, "questionId", 1L);
        QuestionOption c1 = new QuestionOption("Right A", true, 0);
        ReflectionTestUtils.setField(c1, "optionId", 10L);
        QuestionOption w1 = new QuestionOption("Wrong A", false, 1);
        ReflectionTestUtils.setField(w1, "optionId", 11L);
        q1.addOption(c1);
        q1.addOption(w1);

        QuizQuestion q2 = new QuizQuestion("Q2?", "MCQ", 1);
        ReflectionTestUtils.setField(q2, "questionId", 2L);
        QuestionOption c2 = new QuestionOption("Right B", true, 0);
        ReflectionTestUtils.setField(c2, "optionId", 20L);
        QuestionOption w2 = new QuestionOption("Wrong B", false, 1);
        ReflectionTestUtils.setField(w2, "optionId", 21L);
        q2.addOption(c2);
        q2.addOption(w2);

        quiz.addQuestion(q1);
        quiz.addQuestion(q2);
        return quiz;
    }

    /**
     * A Quiz with 1 MCQ_MULTI question (questionId=3):
     *   option 30=correct, option 31=correct, option 32=wrong
     */
    private Quiz mcqMultiQuiz() {
        Quiz quiz = new Quiz(quizId);
        QuizQuestion q = new QuizQuestion("Pick all correct:", "MCQ_MULTI", 0);
        ReflectionTestUtils.setField(q, "questionId", 3L);

        QuestionOption c1 = new QuestionOption("Alpha", true, 0);
        ReflectionTestUtils.setField(c1, "optionId", 30L);
        QuestionOption c2 = new QuestionOption("Beta", true, 1);
        ReflectionTestUtils.setField(c2, "optionId", 31L);
        QuestionOption w = new QuestionOption("Gamma", false, 2);
        ReflectionTestUtils.setField(w, "optionId", 32L);

        q.addOption(c1);
        q.addOption(c2);
        q.addOption(w);
        quiz.addQuestion(q);
        return quiz;
    }
}
