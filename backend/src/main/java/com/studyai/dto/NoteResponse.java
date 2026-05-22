package com.studyai.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NoteResponse {
    private String id;
    private String title;
    private String content;
    private String aiSummary;
    private String subject;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}