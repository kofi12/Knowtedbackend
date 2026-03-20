package com.knowted.KnowtedBackend.application.usecase;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowted.KnowtedBackend.domain.entity.*;
import com.knowted.KnowtedBackend.domain.exception.CourseNotFoundException;
import com.knowted.KnowtedBackend.domain.exception.DocumentNotFoundException;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.*;
import com.knowted.KnowtedBackend.presentation.dto.*;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("unused")
public class QuizUseCase {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(QuizUseCase.class);

    private final JPACourseRepository courseRepository;
    private final JPACourseDocumentRepository documentRepository;
    private final JPAStudyAidRepository studyAidRepository;
    private final JPAQuizRepository quizRepository;
    private final JPAQuizAttemptRepository attemptRepository;
    private final StorageService storageService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Tika tika;

    private final String openaiApiKey;
    private final String openaiModel;

    private static final short QUIZ_TYPE_ID = 2;
    private static final int QUESTION_COUNT = 10;
    private static final int OPTION_COUNT = 5;
    private static final int MAX_TEXT_LENGTH = 15000;

    public QuizUseCase(
            JPACourseRepository courseRepository,
            JPACourseDocumentRepository documentRepository,
            JPAStudyAidRepository studyAidRepository,
            JPAQuizRepository quizRepository,
            JPAQuizAttemptRepository attemptRepository,
            StorageService storageService,
            @Value("${openai.api.key}") String openaiApiKey,
            @Value("${openai.model:gpt-4o-mini}") String openaiModel
    ) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.studyAidRepository = studyAidRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.storageService = storageService;
        this.openaiApiKey = openaiApiKey;
        this.openaiModel = openaiModel;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
        this.objectMapper = new ObjectMapper();
        this.tika = new Tika();
    }

    @Transactional
    public QuizResponseDto generateQuiz(UUID userId, UUID courseId, UUID documentId, String questionType, String userTitle) {
        Course course = courseRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId));

        CourseDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found: " + documentId));

        byte[] docBytes = storageService.download(doc.getStorageKey());
        String documentText = extractTextFromBytes(docBytes, doc.getOriginalFilename());

        if (documentText == null || documentText.isBlank()) {
            throw new IllegalArgumentException("Could not extract any text from the document");
        }
        if (documentText.length() > MAX_TEXT_LENGTH) {
            documentText = documentText.substring(0, MAX_TEXT_LENGTH);
        }

        boolean isMultiSelect = "MCQ_MULTI".equals(questionType);

        String title = (userTitle != null && !userTitle.isBlank())
                ? userTitle.trim() + " - " + course.getName()
                : (isMultiSelect ? "MC Quiz (Difficult)" : "MC Quiz") + " - " + course.getName();

        // Create study aid
        StudyAid studyAid = StudyAid.create(userId, course, documentId, QUIZ_TYPE_ID, title);
        studyAid = studyAidRepository.save(studyAid);

        // Create quiz
        Quiz quiz = new Quiz(studyAid.getStudyAidId());
        quiz = quizRepository.save(quiz);

        // Call OpenAI
        List<Map<String, Object>> generated;
        try {
            generated = callOpenAI(documentText, isMultiSelect);
        } catch (Exception e) {
            log.error("OpenAI quiz generation failed for studyAidId={}", studyAid.getStudyAidId(), e);
            studyAid.setGenerationStatus("FAILED");
            studyAidRepository.save(studyAid);
            throw new RuntimeException("Failed to generate quiz: " + e.getMessage(), e);
        }

        // Save questions and options
        for (int i = 0; i < generated.size(); i++) {
            Map<String, Object> q = generated.get(i);
            String qType = isMultiSelect ? "MCQ_MULTI" : "MCQ";
            QuizQuestion question = new QuizQuestion((String) q.get("question"), qType, i);
            quiz.addQuestion(question);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> opts = (List<Map<String, Object>>) q.get("options");
            for (int j = 0; j < opts.size(); j++) {
                Map<String, Object> opt = opts.get(j);
                boolean correct = Boolean.TRUE.equals(opt.get("correct"));
                QuestionOption option = new QuestionOption((String) opt.get("text"), correct, j);
                question.addOption(option);
            }
        }
        quiz = quizRepository.save(quiz);

        studyAid.setGenerationStatus("DONE");
        studyAidRepository.save(studyAid);

        return buildQuizResponse(studyAid, quiz);
    }

    @Transactional(readOnly = true)
    public QuizResponseDto getQuiz(UUID userId, UUID quizId) {
        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));

        StudyAid studyAid = studyAidRepository.findByIdWithCourse(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Study aid not found for quiz: " + quizId));

        if (!studyAid.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("You don't have access to this quiz");
        }

        return buildQuizResponse(studyAid, quiz);
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDto> listQuizzes(UUID userId, UUID courseId) {
        courseRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId));

        List<StudyAid> studyAids = studyAidRepository.findByCourseIdAndTypeIdWithCourse(courseId, QUIZ_TYPE_ID);

        return studyAids.stream().map(aid -> {
            Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(aid.getStudyAidId()).orElse(null);
            if (quiz == null) return null;
            return buildQuizResponse(aid, quiz);
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @Transactional
    public QuizAttemptResponseDto submitAttempt(UUID userId, UUID quizId, SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));

        StudyAid studyAid = studyAidRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Study aid not found: " + quizId));

        if (!studyAid.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("You don't have access to this quiz");
        }

        QuizAttempt attempt = new QuizAttempt(userId, quiz);

        int correctCount = 0;
        int totalQuestions = quiz.getQuestions().size();

        for (QuizQuestion question : quiz.getQuestions()) {
            List<Long> selectedIds = request.answers().getOrDefault(question.getQuestionId(), List.of());

            // Build lookup of correct option IDs
            Set<Long> correctOptionIds = question.getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .map(QuestionOption::getOptionId)
                    .collect(Collectors.toSet());

            boolean isMulti = "MCQ_MULTI".equals(question.getQuestionType());

            if (isMulti) {
                // For multi-select: correct only if selected set == correct set exactly
                Set<Long> selectedSet = new HashSet<>(selectedIds);
                boolean allCorrect = selectedSet.equals(correctOptionIds);
                if (allCorrect) correctCount++;

                // Store each selected option as an answer row
                for (Long optionId : selectedIds) {
                    QuestionOption opt = question.getOptions().stream()
                            .filter(o -> o.getOptionId().equals(optionId)).findFirst().orElse(null);
                    QuizAttemptAnswer answer = new QuizAttemptAnswer(
                            question.getQuestionId(),
                            optionId,
                            question.getQuestionText(),
                            opt != null ? opt.getOptionText() : "",
                            allCorrect
                    );
                    attempt.addAnswer(answer);
                }
                // If no options selected, store a "no answer" row
                if (selectedIds.isEmpty()) {
                    attempt.addAnswer(new QuizAttemptAnswer(
                            question.getQuestionId(), null,
                            question.getQuestionText(), null, false
                    ));
                }
            } else {
                // Single-select MCQ
                Long selectedId = selectedIds.isEmpty() ? null : selectedIds.get(0);
                boolean isCorrectAnswer = selectedId != null && correctOptionIds.contains(selectedId);
                if (isCorrectAnswer) correctCount++;

                QuestionOption opt = selectedId == null ? null :
                        question.getOptions().stream()
                                .filter(o -> o.getOptionId().equals(selectedId)).findFirst().orElse(null);

                attempt.addAnswer(new QuizAttemptAnswer(
                        question.getQuestionId(),
                        selectedId,
                        question.getQuestionText(),
                        opt != null ? opt.getOptionText() : null,
                        isCorrectAnswer
                ));
            }
        }

        BigDecimal score = totalQuestions > 0
                ? BigDecimal.valueOf(correctCount).multiply(BigDecimal.valueOf(100))
                  .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        attempt.complete(score, totalQuestions);
        attempt = attemptRepository.save(attempt);

        return buildAttemptResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponseDto> listAttempts(UUID userId, UUID quizId) {
        return attemptRepository.findByQuiz_QuizIdAndUserIdOrderByStartedAtDesc(quizId, userId)
                .stream()
                .map(this::buildAttemptResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizAttemptResponseDto getAttempt(UUID userId, Long attemptId) {
        QuizAttempt attempt = attemptRepository.findByIdWithAnswers(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        if (!attempt.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("Not your attempt");
        }

        return buildAttemptResponse(attempt);
    }

    @Transactional
    public void deleteQuiz(UUID userId, UUID quizId) {
        StudyAid studyAid = studyAidRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));

        if (!studyAid.getUserId().equals(userId)) {
            throw new com.knowted.KnowtedBackend.domain.exception.AccessDeniedException("You don't have access to this quiz");
        }

        quizRepository.deleteById(quizId);
        studyAidRepository.deleteById(quizId);
    }

    // ──── OpenAI ────

    private List<Map<String, Object>> callOpenAI(String documentText, boolean isMultiSelect) {
        String multiSelectInstruction = isMultiSelect
                ? "Each question MUST have between 2 and 5 correct answers out of the 5 options. "
                : "Each question must have exactly 1 correct answer out of the 5 options. ";

        String prompt = "You are a study aid generator. Based on the following document text, generate exactly "
                + QUESTION_COUNT + " multiple choice questions. Each question must have exactly "
                + OPTION_COUNT + " options. " + multiSelectInstruction
                + "Return ONLY a JSON array. Each element must have: "
                + "\"question\" (string), \"options\" (array of {\"text\": string, \"correct\": boolean}). "
                + "No markdown, no explanation, just the JSON array.\n\n"
                + "Document text:\n" + documentText;

        Map<String, Object> requestBody = Map.of(
                "model", openaiModel,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a helpful study assistant that creates quizzes."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 4000
        );

        String responseBody = restClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return parseOpenAIResponse(responseBody);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseOpenAIResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText().trim();

            if (content.startsWith("```json")) content = content.substring(7);
            else if (content.startsWith("```")) content = content.substring(3);
            if (content.endsWith("```")) content = content.substring(0, content.length() - 3);
            content = content.trim();

            List<Map<String, Object>> questions = objectMapper.readValue(
                    content, new TypeReference<List<Map<String, Object>>>() {}
            );

            if (questions.size() > QUESTION_COUNT) {
                questions = questions.subList(0, QUESTION_COUNT);
            }

            return questions;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response: " + e.getMessage(), e);
        }
    }

    // ──── Helpers ────

    private String extractTextFromBytes(byte[] bytes, String filename) {
        try (InputStream is = new ByteArrayInputStream(bytes)) {
            return tika.parseToString(is);
        } catch (Exception e) {
            log.warn("Tika text extraction failed for file={}", filename, e);
            return new String(bytes);
        }
    }

    private QuizResponseDto buildQuizResponse(StudyAid studyAid, Quiz quiz) {
        // Determine question type from first question
        String qType = "MCQ";
        if (!quiz.getQuestions().isEmpty()) {
            qType = quiz.getQuestions().iterator().next().getQuestionType();
        }

        List<QuizQuestionDto> questionDtos = quiz.getQuestions().stream()
                .map(q -> new QuizQuestionDto(
                        q.getQuestionId(),
                        q.getQuestionText(),
                        q.getQuestionType(),
                        q.getOrderIndex(),
                        q.getOptions().stream()
                                .map(o -> new QuestionOptionDto(
                                        o.getOptionId(),
                                        o.getOptionText(),
                                        o.isCorrect(),
                                        o.getOrderIndex()
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        UUID courseId = studyAid.getCourse() != null ? studyAid.getCourse().getCourseId() : null;

        return new QuizResponseDto(
                quiz.getQuizId(),
                courseId,
                studyAid.getDocumentId(),
                studyAid.getTitle(),
                studyAid.getGenerationStatus(),
                qType,
                studyAid.getCreatedAt(),
                questionDtos
        );
    }

    private QuizAttemptResponseDto buildAttemptResponse(QuizAttempt attempt) {
        List<AttemptAnswerDto> answerDtos = attempt.getAnswers().stream()
                .map(a -> new AttemptAnswerDto(
                        a.getQuestionId(),
                        a.getSelectedOptionId(),
                        a.getQuestionTextSnapshot(),
                        a.getSelectedOptionTextSnapshot(),
                        a.getIsCorrect()
                ))
                .collect(Collectors.toList());

        return new QuizAttemptResponseDto(
                attempt.getAttemptId(),
                attempt.getQuiz().getQuizId(),
                attempt.getStartedAt(),
                attempt.getCompletedAt(),
                attempt.getScore(),
                attempt.getTotalPoints(),
                answerDtos
        );
    }
}
