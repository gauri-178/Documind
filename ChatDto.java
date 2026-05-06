package com.documind.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatDto {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private Integer messageCount;
}
