package com.studyai.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizQuestionDto {
    private Long id;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String explanation;
    private Integer orderIndex;
}
