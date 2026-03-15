package com.knowted.KnowtedBackend.infrastructure.openai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses the structured text the AI returns into question/answer pairs.
 *
 * Expected AI output format (one card per block, blank line between cards):
 *
 *   Q: What is photosynthesis?
 *   A: The process by which plants convert sunlight into glucose.
 *
 *   Q: What organelle conducts photosynthesis?
 *   A: The chloroplast.
 *
 * This is intentionally simple so parsing is robust.
 */
@Component
public class FlashcardResponseParser {

    public record FlashcardPair(String question, String answer) {}

    /**
     * Parses the raw AI response text into a list of Q&A pairs.
     * Silently skips malformed blocks so one bad card doesn't crash the whole batch.
     */
    public List<FlashcardPair> parse(String rawResponse) {
        List<FlashcardPair> result = new ArrayList<>();

        // Split on blank lines to get individual card blocks
        String[] blocks = rawResponse.trim().split("\\n\\s*\\n");

        for (String block : blocks) {
            String[] lines = block.trim().split("\\n");

            String question = null;
            String answer   = null;

            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("Q:") || line.startsWith("Q :")) {
                    question = line.replaceFirst("Q\\s*:", "").trim();
                } else if (line.startsWith("A:") || line.startsWith("A :")) {
                    answer = line.replaceFirst("A\\s*:", "").trim();
                }
            }

            if (question != null && !question.isBlank()
                    && answer != null && !answer.isBlank()) {
                result.add(new FlashcardPair(question, answer));
            }
        }

        return result;
    }
}
