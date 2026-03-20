package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "quiz_questions")
@SuppressWarnings("unused")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @Column(name = "question_type", nullable = false)
    private String questionType = "MCQ";

    @Column(name = "points", nullable = false)
    private int points = 1;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private Set<QuestionOption> options = new LinkedHashSet<>();

    protected QuizQuestion() {}

    public QuizQuestion(String questionText, String questionType, int orderIndex) {
        this.questionText = questionText;
        this.questionType = questionType;
        this.orderIndex = orderIndex;
    }

    public Long getQuestionId() { return questionId; }
    public Quiz getQuiz() { return quiz; }
    public String getQuestionText() { return questionText; }
    public String getQuestionType() { return questionType; }
    public int getPoints() { return points; }
    public int getOrderIndex() { return orderIndex; }
    public Set<QuestionOption> getOptions() { return options; }

    void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public void addOption(QuestionOption option) {
        options.add(option);
        option.setQuestion(this);
    }
}
