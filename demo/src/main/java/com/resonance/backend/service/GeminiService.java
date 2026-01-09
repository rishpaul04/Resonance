package com.resonance.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import javax.annotation.PostConstruct;
import java.util.Base64;
import java.util.Map;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String API_KEY; 
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.webClient = WebClient.create();
        this.objectMapper = new ObjectMapper();
    }

    // 👇 This checks if your Key is loaded correctly when you start the app
    @PostConstruct
    public void init() {
        if (API_KEY == null || API_KEY.isEmpty() || API_KEY.startsWith("API_KEY")) {
            System.err.println("❌ CRITICAL ERROR: API Key is MISSING or INVALID in application.properties!");
        } else {
            System.out.println("✅ API Key loaded successfully: " + API_KEY.substring(0, 5) + "...");
        }
    }

    public Flux<String> transcribe(byte[] audioBytes) {
        // Log that we received audio (Debugging)
        // System.out.println("Received audio chunk: " + audioBytes.length + " bytes");

        if (audioBytes.length < 2000) { 
            return Flux.empty();
        }

        String base64Audio = Base64.getEncoder().encodeToString(audioBytes);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=" + API_KEY;

        Map<String, Object> payload = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", "Transcribe audio. Return text only."),
                    Map.of("inline_data", Map.of(
                        "mime_type", "audio/webm",
                        "data", base64Audio
                    ))
                ))
            )
        );

        return webClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(payload)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractTextFromJson)
                .onErrorResume(e -> {
                    // 👇 PRINT THE ERROR so we know what's wrong!
                    System.err.println("❌ GEMINI API ERROR: " + e.getMessage());
                    return Flux.empty();
                });
    }

    private String extractTextFromJson(String jsonChunk) {
        try {
            JsonNode root = objectMapper.readTree(jsonChunk);
            if (root.isArray()) root = root.get(0);
            
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText();
                    // System.out.println("Transcribed: " + text); // Debug print
                    return text;
                }
            }
        } catch (Exception e) {
            // Ignore parsing errors
        }
        return "";
    }
}