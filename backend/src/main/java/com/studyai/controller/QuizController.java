package com.studyai.controller;

import com.studyai.dto.GenerateQuizRequest;
import com.studyai.dto.QuizRequest;
import com.studyai.dto.QuizResponse;
import com.studyai.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(quizService.createQuiz(request, auth.getName()));
    }

    @PostMapping("/generate")
    public ResponseEntity<QuizResponse> generateAiQuiz(@Valid @RequestBody GenerateQuizRequest request,
                                                       Authentication auth) {
        return ResponseEntity.ok(quizService.generateAiQuiz(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes(Authentication auth) {
        return ResponseEntity.ok(quizService.getAllQuizzes(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(quizService.getQuizById(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String id, Authentication auth) {
        quizService.deleteQuiz(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}