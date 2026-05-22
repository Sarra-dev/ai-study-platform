package com.studyai.controller;

import com.studyai.ai.ClaudeAiService;
import com.studyai.dto.AiChatRequest;
import com.studyai.dto.AiChatResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private ClaudeAiService aiService;

    @Value("${app.ai.model:gemini-1.5-flash}")
    private String model;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request,
                                               Authentication auth) {
        String response = aiService.chat(request.getMessage(), request.getContext());
        return ResponseEntity.ok(AiChatResponse.builder()
                .response(response)
                .model(model)
                .build());
    }

    @PostMapping("/summarize")
    public ResponseEntity<Map<String, String>> summarize(@RequestBody Map<String, String> body,
                                                         Authentication auth) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "text is required"));
        }
        return ResponseEntity.ok(Map.of("summary", aiService.summarizeText(text)));
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explain(@RequestBody Map<String, String> body,
                                                       Authentication auth) {
        String concept = body.get("concept");
        if (concept == null || concept.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "concept is required"));
        }
        return ResponseEntity.ok(Map.of("explanation", aiService.explainConcept(concept)));
    }
}