package com.studyai.dto;

import com.studyai.model.Task;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private LocalDate dueDate;
    private String subject;
    private LocalDateTime createdAt;
}