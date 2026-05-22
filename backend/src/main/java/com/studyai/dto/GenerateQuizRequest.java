package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GenerateQuizRequest {
    @NotBlank private String text;
    private int numberOfQuestions = 5;
    private String subject;
}
