package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizRequest {
    @NotBlank public String title;
    public String subject;
    public String description;
    public List<QuizQuestionDto> questions;
}
