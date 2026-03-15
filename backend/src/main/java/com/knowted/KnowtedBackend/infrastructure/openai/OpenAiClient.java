package com.knowted.KnowtedBackend.infrastructure.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the OpenAI Chat Completions API.
 * Uses Java's built-in HttpClient so we don't need an extra SDK dependency.
 */
@Component
public class OpenAiClient {

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL      = "gpt-4o-mini"; // cheap + capable; swap to gpt-4o if desired

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiClient(@Value("${openai.api-key}") String apiKey) {
        this.apiKey       = apiKey;
        this.httpClient   = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sends a prompt to OpenAI and returns the raw assistant text response.
     *
     * @param systemPrompt  Role/instruction text for the model.
     * @param userMessage   The actual user content (may include extracted PDF text).
     * @return              Raw text from the model's first choice.
     */
    public String chat(String systemPrompt, String userMessage) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "temperature", 0.3,          // lower = more deterministic / structured output
                    "max_tokens", 2000,
                    "messages", List.of(
                            Map.of("role", "system",  "content", systemPrompt),
                            Map.of("role", "user",    "content", userMessage)
                    )
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new OpenAiException("OpenAI returned HTTP " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.at("/choices/0/message/content").asText();

        } catch (OpenAiException e) {
            throw e;
        } catch (Exception e) {
            throw new OpenAiException("Failed to call OpenAI API: " + e.getMessage(), e);
        }
    }
}
