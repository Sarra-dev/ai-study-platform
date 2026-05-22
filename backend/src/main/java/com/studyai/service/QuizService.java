package com.studyai.service;

import com.studyai.ai.ClaudeAiService;
import com.studyai.dto.GenerateQuizRequest;
import com.studyai.dto.QuizQuestionDto;
import com.studyai.dto.QuizRequest;
import com.studyai.dto.QuizResponse;
import com.studyai.model.Quiz;
import com.studyai.model.QuizQuestion;
import com.studyai.model.User;
import com.studyai.repository.QuizRepository;
import com.studyai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired private QuizRepository quizRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClaudeAiService aiService;

    public QuizResponse createQuiz(QuizRequest request, String email) {
        User user = getUser(email);
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .subject(request.getSubject())
                .description(request.getDescription())
                .userId(user.getId())
                .build();

        if (request.getQuestions() != null) {
            quiz.setQuestions(request.getQuestions().stream()
                    .map(this::dtoToEntity)
                    .collect(Collectors.toList()));
        }

        return toResponse(quizRepository.save(quiz));
    }

    public QuizResponse generateAiQuiz(GenerateQuizRequest request, String email) {
        User user = getUser(email);

        List<QuizQuestionDto> generated = aiService.generateMcqQuestions(
                request.getText(),
                request.getNumberOfQuestions(),
                request.getSubject()
        );

        Quiz quiz = Quiz.builder()
                .title("AI Quiz: " + (request.getSubject() != null ? request.getSubject() : "Generated Quiz"))
                .subject(request.getSubject())
                .description("AI-generated quiz from text")
                .userId(user.getId())
                .questions(generated.stream().map(this::dtoToEntity).collect(Collectors.toList()))
                .build();

        return toResponse(quizRepository.save(quiz));
    }

    public List<QuizResponse> getAllQuizzes(String email) {
        User user = getUser(email);
        return quizRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public QuizResponse getQuizById(String id, String email) {
        User user = getUser(email);
        Quiz quiz = quizRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return toResponse(quiz);
    }

    public void deleteQuiz(String id, String email) {
        User user = getUser(email);
        Quiz quiz = quizRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quizRepository.delete(quiz);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private QuizQuestion dtoToEntity(QuizQuestionDto dto) {
        return QuizQuestion.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString())
                .questionText(dto.getQuestionText())
                .optionA(dto.getOptionA())
                .optionB(dto.getOptionB())
                .optionC(dto.getOptionC())
                .optionD(dto.getOptionD())
                .correctAnswer(dto.getCorrectAnswer())
                .explanation(dto.getExplanation())
                .orderIndex(dto.getOrderIndex())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizQuestionDto> questionDtos = quiz.getQuestions() == null ? List.of() :
                quiz.getQuestions().stream().map(q -> QuizQuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctAnswer(q.getCorrectAnswer())
                        .explanation(q.getExplanation())
                        .orderIndex(q.getOrderIndex())
                        .build()
                ).collect(Collectors.toList());

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .subject(quiz.getSubject())
                .description(quiz.getDescription())
                .questions(questionDtos)
                .createdAt(quiz.getCreatedAt())
                .build();
    }
}