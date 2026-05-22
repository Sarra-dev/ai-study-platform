package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GenerateQuizRequest {
    @NotBlank public String text;
    public int numberOfQuestions = 5;
    public String subject;
}
