package com.documind.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String name;
    private String email;

    public JwtResponse(String token, String name, String email) {
        this.token = token;
        this.name  = name;
        this.email = email;
    }
}
