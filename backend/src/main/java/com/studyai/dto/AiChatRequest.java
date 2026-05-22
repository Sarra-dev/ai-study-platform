package com.studyai.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiChatRequest {
    @NotBlank public String message;
    public String context;
}
