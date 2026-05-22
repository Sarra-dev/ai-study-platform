package com.studyai.dto;
import com.studyai.model.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskRequest {
    @NotBlank public String title;
    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private LocalDate dueDate;
    private String subject;
}
