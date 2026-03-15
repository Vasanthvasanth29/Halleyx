package com.halleyx.workflow.controller;

import com.halleyx.workflow.model.User;
import com.halleyx.workflow.security.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        authService.registerUser(
                signUpRequest.getUsername(), 
                signUpRequest.getEmail(), 
                signUpRequest.getPassword()
        );
        return ResponseEntity.ok("User registered successfully!");
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class SignupRequest {
        private String username;
        private String email;
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class JwtResponse {
        private String token;
    }
}
