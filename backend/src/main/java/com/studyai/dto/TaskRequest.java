package com.studyai.dto;
import com.studyai.model.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskRequest {
    @NotBlank public String title;
    public String description;
    public Task.Status status;
    public Task.Priority priority;
    public LocalDate dueDate;
    public String subject;
}
