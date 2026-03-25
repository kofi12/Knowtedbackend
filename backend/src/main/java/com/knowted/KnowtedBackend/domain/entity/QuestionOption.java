package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "question_options")
@SuppressWarnings("unused")
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "option_text", nullable = false)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    protected QuestionOption() {}

    public QuestionOption(String optionText, boolean isCorrect, int orderIndex) {
        this.optionText = optionText;
        this.isCorrect = isCorrect;
        this.orderIndex = orderIndex;
    }

    public Long getOptionId() { return optionId; }
    public QuizQuestion getQuestion() { return question; }
    public String getOptionText() { return optionText; }
    public boolean isCorrect() { return isCorrect; }
    public int getOrderIndex() { return orderIndex; }

    void setQuestion(QuizQuestion question) { this.question = question; }
}
