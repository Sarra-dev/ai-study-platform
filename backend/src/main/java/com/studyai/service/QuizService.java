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
                .user(user)
                .build();

        if (request.getQuestions() != null) {
            List<QuizQuestion> questions = request.getQuestions().stream()
                    .map(q -> mapToEntity(q, quiz))
                    .collect(Collectors.toList());
            quiz.setQuestions(questions);
        }

        return toResponse(quizRepository.save(quiz));
    }

    public QuizResponse generateAiQuiz(GenerateQuizRequest request, String email) {
        User user = getUser(email);

        List<QuizQuestionDto> generatedQs = aiService.generateMcqQuestions(
                request.getText(),
                request.getNumberOfQuestions(),
                request.getSubject()
        );

        Quiz quiz = Quiz.builder()
                .title("AI Quiz: " + (request.getSubject() != null ? request.getSubject() : "Generated Quiz"))
                .subject(request.getSubject())
                .description("AI-generated quiz from text")
                .user(user)
                .build();

        List<QuizQuestion> questions = generatedQs.stream()
                .map(q -> mapToEntity(q, quiz))
                .collect(Collectors.toList());
        quiz.setQuestions(questions);

        return toResponse(quizRepository.save(quiz));
    }

    public List<QuizResponse> getAllQuizzes(String email) {
        User user = getUser(email);
        return quizRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id, String email) {
        User user = getUser(email);
        Quiz quiz = quizRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return toResponse(quiz);
    }

    public void deleteQuiz(Long id, String email) {
        User user = getUser(email);
        Quiz quiz = quizRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quizRepository.delete(quiz);
    }

    private QuizQuestion mapToEntity(QuizQuestionDto dto, Quiz quiz) {
        return QuizQuestion.builder()
                .questionText(dto.getQuestionText())
                .optionA(dto.getOptionA())
                .optionB(dto.getOptionB())
                .optionC(dto.getOptionC())
                .optionD(dto.getOptionD())
                .correctAnswer(dto.getCorrectAnswer())
                .explanation(dto.getExplanation())
                .orderIndex(dto.getOrderIndex())
                .quiz(quiz)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizQuestionDto> questionDtos = quiz.getQuestions() == null ? List.of() :
                quiz.getQuestions().stream().map(q -> {
                    QuizQuestionDto dto = new QuizQuestionDto();
                    dto.setId(q.getId());
                    dto.setQuestionText(q.getQuestionText());
                    dto.setOptionA(q.getOptionA());
                    dto.setOptionB(q.getOptionB());
                    dto.setOptionC(q.getOptionC());
                    dto.setOptionD(q.getOptionD());
                    dto.setCorrectAnswer(q.getCorrectAnswer());
                    dto.setExplanation(q.getExplanation());
                    dto.setOrderIndex(q.getOrderIndex());
                    return dto;
                }).collect(Collectors.toList());

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
