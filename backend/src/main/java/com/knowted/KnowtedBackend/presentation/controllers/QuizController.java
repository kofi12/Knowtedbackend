package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.QuizUseCase;
import com.knowted.KnowtedBackend.presentation.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final QuizUseCase quizUseCase;

    @Operation(summary = "Generate a quiz from a document")
    @PostMapping("/courses/{courseId}/quizzes/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public QuizResponseDto generateQuiz(
            @PathVariable UUID courseId,
            @RequestParam UUID documentId,
            @RequestParam(defaultValue = "MCQ") String questionType,
            @RequestParam(required = false) String title,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.generateQuiz(userId, courseId, documentId, questionType, title);
    }

    @Operation(summary = "List all quizzes in a course")
    @GetMapping("/courses/{courseId}/quizzes")
    public List<QuizResponseDto> listQuizzes(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.listQuizzes(userId, courseId);
    }

    @Operation(summary = "Get a specific quiz with all questions and options")
    @GetMapping("/quizzes/{quizId}")
    public QuizResponseDto getQuiz(
            @PathVariable UUID quizId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.getQuiz(userId, quizId);
    }

    @Operation(summary = "Submit a quiz attempt")
    @PostMapping("/quizzes/{quizId}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public QuizAttemptResponseDto submitAttempt(
            @PathVariable UUID quizId,
            @RequestBody SubmitQuizRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.submitAttempt(userId, quizId, request);
    }

    @Operation(summary = "List all attempts for a quiz")
    @GetMapping("/quizzes/{quizId}/attempts")
    public List<QuizAttemptResponseDto> listAttempts(
            @PathVariable UUID quizId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.listAttempts(userId, quizId);
    }

    @Operation(summary = "Get a specific attempt with answers")
    @GetMapping("/quizzes/attempts/{attemptId}")
    public QuizAttemptResponseDto getAttempt(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.getAttempt(userId, attemptId);
    }

    @Operation(summary = "List all questions across all quizzes in a course")
    @GetMapping("/courses/{courseId}/questions")
    public List<QuizQuestionDto> listCourseQuestions(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return quizUseCase.listCourseQuestions(userId, courseId);
    }

    @Operation(summary = "Delete a quiz")
    @DeleteMapping("/quizzes/{quizId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(
            @PathVariable UUID quizId,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        quizUseCase.deleteQuiz(userId, quizId);
    }
}
