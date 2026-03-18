package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Identifier (Email or Username) is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
