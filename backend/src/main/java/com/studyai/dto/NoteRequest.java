package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NoteRequest {
    @NotBlank private String title;
    @NotBlank private String content;
    private String subject;
    private String tags;
}
