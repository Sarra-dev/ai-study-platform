package com.studyai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.studyai.dto.QuizQuestionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
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

    // ── Public methods ────────────────────────────────────────────────────────

    public String summarizeText(String text) {
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Cannot summarize empty text");
        }
        String prompt =
                "Please summarize the following study notes in a clear, concise way. " +
                        "Focus on key concepts, main points, and important details. " +
                        "Format the summary with bullet points for easy reading.\n\nNotes:\n" + text;
        return callGemini(prompt, 2048);
    }

    public List<QuizQuestionDto> generateMcqQuestions(String text, int numberOfQuestions, String subject) {
        String prompt = String.format(
                "Generate exactly %d multiple choice questions (MCQ) based on the following text.\n" +
                        "Subject: %s\n\n" +
                        "IMPORTANT: Return ONLY a valid JSON array with no markdown, no backticks, no explanation. " +
                        "The array must start with [ and end with ]. Format each element as:\n" +
                        "{\"questionText\":\"...\",\"optionA\":\"...\",\"optionB\":\"...\",\"optionC\":\"...\"," +
                        "\"optionD\":\"...\",\"correctAnswer\":\"A\",\"explanation\":\"...\",\"orderIndex\":1}\n\n" +
                        "Text:\n%s",
                numberOfQuestions,
                subject != null ? subject : "General",
                text
        );
        String jsonResponse = callGemini(prompt, 4096);
        return parseMcqJson(jsonResponse);
    }

    public String chat(String userMessage, String context) {
        String fullPrompt =
                "You are a helpful AI study assistant for students. " +
                        "Explain concepts clearly, help understand difficult topics, provide examples. " +
                        "Be friendly, patient, and educational.\n\n" +
                        (context != null && !context.isBlank() ? "Context:\n" + context + "\n\n" : "") +
                        "Student question: " + userMessage;
        return callGemini(fullPrompt, 2048);
    }

    public String explainConcept(String concept) {
        String prompt =
                "Explain the following concept simply for a student:\n\nConcept: " + concept +
                        "\n\nInclude:\n1. Simple definition\n2. Why it matters\n3. Real-world example\n4. Key points";
        return callGemini(prompt, 2048);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Calls the Gemini generateContent endpoint.
     *
     * @param prompt         The full prompt string.
     * @param maxOutputTokens How many tokens the model may generate.
     * @return The model's text response.
     */
    private String callGemini(String prompt, int maxOutputTokens) {
        try {
            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();

            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            ObjectNode generationConfig = requestBody.putObject("generationConfig");
            generationConfig.put("maxOutputTokens", maxOutputTokens);
            generationConfig.put("temperature", 0.7);

            String url = "/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            String responseJson = webClient.post()
                    .uri(url)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .map(body -> new RuntimeException(
                                            "Gemini API error " + clientResponse.statusCode() + ": " + body))
                    )
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);

            // Gracefully handle safety blocks or empty candidates
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                String errorMsg = root.path("error").path("message").asText("Unknown Gemini error");
                throw new RuntimeException("Gemini returned no candidates: " + errorMsg);
            }

            JsonNode firstCandidate = candidates.get(0);

            // Check finish reason for safety blocks
            String finishReason = firstCandidate.path("finishReason").asText("");
            if ("SAFETY".equals(finishReason)) {
                throw new RuntimeException("Gemini blocked the response due to safety filters.");
            }

            String text = firstCandidate
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            if (text.isBlank()) {
                throw new RuntimeException("Gemini returned an empty response.");
            }

            return text;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini AI: " + e.getMessage(), e);
        }
    }

    private List<QuizQuestionDto> parseMcqJson(String jsonStr) {
        List<QuizQuestionDto> questions = new ArrayList<>();
        try {
            // Strip markdown fences if the model ignores the instruction
            String cleaned = jsonStr
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();

            // Extract the JSON array substring
            int start = cleaned.indexOf('[');
            int end   = cleaned.lastIndexOf(']');
            if (start == -1 || end == -1 || end <= start) {
                throw new RuntimeException("No JSON array found in AI response: " + cleaned);
            }
            cleaned = cleaned.substring(start, end + 1);

            JsonNode array = objectMapper.readTree(cleaned);
            int index = 1;
            for (JsonNode q : array) {
                QuizQuestionDto dto = QuizQuestionDto.builder()
                        .questionText(q.path("questionText").asText())
                        .optionA(q.path("optionA").asText())
                        .optionB(q.path("optionB").asText())
                        .optionC(q.path("optionC").asText())
                        .optionD(q.path("optionD").asText())
                        .correctAnswer(q.path("correctAnswer").asText())
                        .explanation(q.path("explanation").asText(""))
                        .orderIndex(q.path("orderIndex").asInt(index))
                        .build();
                questions.add(dto);
                index++;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI quiz response: " + e.getMessage(), e);
        }
        return questions;
    }
}