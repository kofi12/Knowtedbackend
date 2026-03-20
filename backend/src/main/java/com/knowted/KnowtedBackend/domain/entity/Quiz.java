package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@SuppressWarnings("unused")
public class Quiz {

    @Id
    @Column(name = "quiz_id")
    private UUID quizId;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "randomize_questions", nullable = false)
    private boolean randomizeQuestions = false;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private Set<QuizQuestion> questions = new LinkedHashSet<>();

    protected Quiz() {}

    public Quiz(UUID quizId) {
        this.quizId = quizId;
    }

    public UUID getQuizId() { return quizId; }
    public Integer getTimeLimitSeconds() { return timeLimitSeconds; }
    public boolean isRandomizeQuestions() { return randomizeQuestions; }
    public Set<QuizQuestion> getQuestions() { return questions; }

    public void addQuestion(QuizQuestion question) {
        questions.add(question);
        question.setQuiz(this);
    }
}
