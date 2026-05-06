package com.documind.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MessageDto {
    private Long id;
    private String role;
    private String text;
    private LocalDateTime timestamp;
    private List<DocumentDto> documents;
}
