package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JPAQuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByQuiz_QuizIdAndUserIdOrderByStartedAtDesc(UUID quizId, UUID userId);

    @Query("SELECT a FROM QuizAttempt a LEFT JOIN FETCH a.answers WHERE a.attemptId = :attemptId")
    Optional<QuizAttempt> findByIdWithAnswers(@Param("attemptId") Long attemptId);
}
