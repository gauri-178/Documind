package com.documind.backend.service;

import java.io.File;
import java.util.List;

public interface AiIntelligenceService {
    
    /**
     * Generates an AI response based on a user query and relevant document context.
     */
    String generateResponse(String query, String context);

    /**
     * Processes a document (extracts text and creates embeddings).
     */
    void processDocument(Long documentId, File file);
    
    /**
     * Searches for relevant chunks based on a query.
     */
    String getRelevantContext(String query, int limit);
}
