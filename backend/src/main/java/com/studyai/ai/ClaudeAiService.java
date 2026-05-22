package com.studyai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.studyai.dto.QuizQuestionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClaudeAiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.model:gemini-1.5-flash}")
    private String model;

    public ClaudeAiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String summarizeText(String text) {
        String prompt = "Please summarize the following study notes in a clear, concise way. " +
                "Focus on key concepts, main points, and important details. " +
                "Format the summary with bullet points for easy reading.\n\nNotes:\n" + text;
        return callGemini(prompt);
    }

    public List<QuizQuestionDto> generateMcqQuestions(String text, int numberOfQuestions, String subject) {
        String prompt = String.format(
                "Generate exactly %d multiple choice questions (MCQ) based on the following text.\n" +
                        "Subject: %s\n\n" +
                        "IMPORTANT: Return ONLY a valid JSON array, no markdown, no backticks. Format:\n" +
                        "[{\"questionText\":\"...\",\"optionA\":\"...\",\"optionB\":\"...\",\"optionC\":\"...\",\"optionD\":\"...\",\"correctAnswer\":\"A\",\"explanation\":\"...\",\"orderIndex\":1}]\n\n" +
                        "Text:\n%s",
                numberOfQuestions,
                subject != null ? subject : "General",
                text
        );
        String jsonResponse = callGemini(prompt);
        return parseMcqJson(jsonResponse);
    }

    public String chat(String userMessage, String context) {
        String fullPrompt = "You are a helpful AI study assistant for students. " +
                "Explain concepts clearly, help understand difficult topics, provide examples. " +
                "Be friendly, patient, and educational.\n\n" +
                (context != null && !context.isEmpty() ? "Context:\n" + context + "\n\n" : "") +
                "Student question: " + userMessage;
        return callGemini(fullPrompt);
    }

    public String explainConcept(String concept) {
        String prompt = "Explain the following concept simply for a student:\n\nConcept: " + concept +
                "\n\nInclude: 1. Simple definition 2. Why it matters 3. Real-world example 4. Key points";
        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            ObjectNode generationConfig = requestBody.putObject("generationConfig");
            generationConfig.put("maxOutputTokens", 2048);
            generationConfig.put("temperature", 0.7);

            String url = "/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            String responseJson = webClient.post()
                    .uri(url)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini AI: " + e.getMessage(), e);
        }
    }

    private List<QuizQuestionDto> parseMcqJson(String jsonStr) {
        List<QuizQuestionDto> questions = new ArrayList<>();
        try {
            String cleaned = jsonStr.replaceAll("```json", "").replaceAll("```", "").trim();
            int start = cleaned.indexOf('[');
            int end = cleaned.lastIndexOf(']');
            if (start != -1 && end != -1) cleaned = cleaned.substring(start, end + 1);

            JsonNode array = objectMapper.readTree(cleaned);
            int index = 1;
            for (JsonNode q : array) {
                // Build using constructor directly — no setters needed
                QuizQuestionDto dto = QuizQuestionDto.builder()
                        .questionText(q.path("questionText").asText())
                        .optionA(q.path("optionA").asText())
                        .optionB(q.path("optionB").asText())
                        .optionC(q.path("optionC").asText())
                        .optionD(q.path("optionD").asText())
                        .correctAnswer(q.path("correctAnswer").asText())
                        .explanation(q.path("explanation").asText())
                        .orderIndex(q.path("orderIndex").asInt(index))
                        .build();
                questions.add(dto);
                index++;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI quiz response: " + e.getMessage());
        }
        return questions;
    }
}