package com.studyai.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiChatResponse {
    private String response;
    private String model;
}
