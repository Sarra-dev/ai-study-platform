package com.studyai.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String subject;
    private String description;
    private List<QuizQuestionDto> questions;
    private LocalDateTime createdAt;
}
