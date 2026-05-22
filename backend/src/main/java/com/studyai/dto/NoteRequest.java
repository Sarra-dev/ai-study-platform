package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NoteRequest {
    @NotBlank public String title;
    @NotBlank public String content;
    public String subject;
    public String tags;
}
