package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "quiz_attempt_answers")
@SuppressWarnings("unused")
public class QuizAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_answer_id")
    private Long attemptAnswerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "selected_option_id")
    private Long selectedOptionId;

    @Column(name = "question_text_snapshot", nullable = false)
    private String questionTextSnapshot;

    @Column(name = "selected_option_text_snapshot")
    private String selectedOptionTextSnapshot;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @CreationTimestamp
    @Column(name = "answered_at", updatable = false)
    private Instant answeredAt;

    protected QuizAttemptAnswer() {}

    public QuizAttemptAnswer(Long questionId, Long selectedOptionId,
                             String questionTextSnapshot, String selectedOptionTextSnapshot,
                             Boolean isCorrect) {
        this.questionId = questionId;
        this.selectedOptionId = selectedOptionId;
        this.questionTextSnapshot = questionTextSnapshot;
        this.selectedOptionTextSnapshot = selectedOptionTextSnapshot;
        this.isCorrect = isCorrect;
    }

    public Long getAttemptAnswerId() { return attemptAnswerId; }
    public QuizAttempt getAttempt() { return attempt; }
    public Long getQuestionId() { return questionId; }
    public Long getSelectedOptionId() { return selectedOptionId; }
    public String getQuestionTextSnapshot() { return questionTextSnapshot; }
    public String getSelectedOptionTextSnapshot() { return selectedOptionTextSnapshot; }
    public Boolean getIsCorrect() { return isCorrect; }
    public Instant getAnsweredAt() { return answeredAt; }

    void setAttempt(QuizAttempt attempt) { this.attempt = attempt; }
}
