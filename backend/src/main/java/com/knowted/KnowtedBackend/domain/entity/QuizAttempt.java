package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
@SuppressWarnings("unused")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_id")
    private Long attemptId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "score")
    private BigDecimal score;

    @Column(name = "total_points")
    private Integer totalPoints;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAttemptAnswer> answers = new ArrayList<>();

    protected QuizAttempt() {}

    public QuizAttempt(UUID userId, Quiz quiz) {
        this.userId = userId;
        this.quiz = quiz;
    }

    public Long getAttemptId() { return attemptId; }
    public UUID getUserId() { return userId; }
    public Quiz getQuiz() { return quiz; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public BigDecimal getScore() { return score; }
    public Integer getTotalPoints() { return totalPoints; }
    public List<QuizAttemptAnswer> getAnswers() { return answers; }

    public void complete(BigDecimal score, int totalPoints) {
        this.completedAt = Instant.now();
        this.score = score;
        this.totalPoints = totalPoints;
    }

    public void addAnswer(QuizAttemptAnswer answer) {
        answers.add(answer);
        answer.setAttempt(this);
    }
}
