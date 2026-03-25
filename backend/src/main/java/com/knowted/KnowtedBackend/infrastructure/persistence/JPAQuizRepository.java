package com.knowted.KnowtedBackend.infrastructure.persistence;

import com.knowted.KnowtedBackend.domain.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface JPAQuizRepository extends JpaRepository<Quiz, UUID> {

    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions qs LEFT JOIN FETCH qs.options WHERE q.quizId = :quizId")
    Optional<Quiz> findByIdWithQuestionsAndOptions(@Param("quizId") UUID quizId);
}
