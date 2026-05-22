package com.studyai.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    @Builder.Default
    private Status status = Status.TODO;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    private LocalDate dueDate;
    private String subject;

    @Indexed
    private String userId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        TODO, IN_PROGRESS, DONE
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }
}