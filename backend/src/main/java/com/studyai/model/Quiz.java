package com.studyai.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    private String id;

    private String title;
    private String subject;
    private String description;

    /** Questions are embedded (no separate collection needed in MongoDB). */
    private List<QuizQuestion> questions;

    @Indexed
    private String userId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}