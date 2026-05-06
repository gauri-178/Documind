package com.documind.backend.entity.mysql;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vector_embeddings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorEmbedding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId; // Links to MySQL Document ID

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentChunk; // The actual text fragment

    // Changed from vector(1536) to LONGTEXT for MySQL compatibility
    @Column(columnDefinition = "LONGTEXT") 
    private String embedding; // Stored as a comma-separated string or JSON

    @CreationTimestamp
    private LocalDateTime createdAt;
}
