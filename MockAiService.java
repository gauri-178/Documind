package com.documind.backend.service.impl;

import com.documind.backend.service.AiIntelligenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class MockAiService implements AiIntelligenceService {
    private static final Logger logger = LoggerFactory.getLogger(MockAiService.class);

    @Override
    public String generateResponse(String query, String context) {
        logger.info("Generating mock AI response for query: {}", query);
        try {
            // Simulate AI processing latency
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (context != null && !context.isEmpty()) {
            return "Based on your documents (Context: " + (context.length() > 50 ? context.substring(0, 47) + "..." : context) + "), I can confirm that... [This is a mock AI response]";
        }
        
        return "I've analyzed your query: \"" + query + "\". How else can I help you today? [This is a mock AI response]";
    }

    @Override
    public void processDocument(Long documentId, File file) {
        logger.info("Mock processing document id: {} (File: {})", documentId, file.getName());
        // In a real implementation, this would involve OCR/Text extraction and vector embedding storage.
    }

    @Override
    public String getRelevantContext(String query, int limit) {
        logger.info("Fetching mock context for query: {}", query);
        return "This is placeholder context retrieved from your documents.";
    }
}
