package com.studyai.model;

import lombok.*;

/**
 * Embedded document — stored inside the Quiz document.
 * No @Document annotation needed because it is never a top-level collection.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    /** Client-facing ID (simple sequential string like "q1", "q2" …). */
    private String id;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;  // "A", "B", "C", or "D"
    private String explanation;
    private Integer orderIndex;
}