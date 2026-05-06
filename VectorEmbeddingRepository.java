package com.documind.backend.repository.mysql;

import com.documind.backend.entity.mysql.VectorEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VectorEmbeddingRepository extends JpaRepository<VectorEmbedding, Long> {
    
    // In MySQL mode, we perform standard retrieval
    List<VectorEmbedding> findByDocumentId(Long documentId);
}
