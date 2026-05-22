package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizRequest {
    @NotBlank private String title;
    private String subject;
    private String description;
    private List<QuizQuestionDto> questions;
}
