package com.documind.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentDto {
    private Long id;
    private String name;
    private String type;
    private Long size;
}
