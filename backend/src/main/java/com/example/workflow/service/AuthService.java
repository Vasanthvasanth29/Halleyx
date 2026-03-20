package com.example.workflow.service;

import com.example.workflow.dto.AuthResponse;
import com.example.workflow.dto.LoginRequest;
import com.example.workflow.dto.RegisterRequest;
import com.example.workflow.entity.Role;
import com.example.workflow.entity.User;
import com.example.workflow.repository.UserRepository;
import com.example.workflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    //private final RabbitMQProducer rabbitMQProducer;
    private final AuditLogService auditLogService;

    public AuthResponse register(RegisterRequest request) {

        // Check username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Check email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .build();

        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Data integrity failure: " + e.getMessage());
        }

        // Publish RabbitMQ event
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("event", "USER_REGISTERED");
        eventPayload.put("username", user.getUsername());
        eventPayload.put("email", user.getEmail());
        eventPayload.put("role", user.getRole() != null ? user.getRole().name() : "USER");

        if (user.getCategory() != null) {
            eventPayload.put("category", user.getCategory());
        }

        try {
            //rabbitMQProducer.sendUserRegisteredEvent(eventPayload);
        } catch (Exception e) {
            // Log error but don't fail registration if RMQ is down
            System.err.println("RabbitMQ Offline: " + e.getMessage());
        }

        // Audit Log
        auditLogService.logEvent(
                "USER_REGISTRATION",
                "GENERAL",
                "N/A",
                user,
                "New user registered: " + user.getUsername(),
                null,
                "SUCCESS"
        );

        // Generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .role(user.getRole())
                .category(user.getCategory())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("Login Attempt for: " + request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            System.out.println("Authentication Manager Success");
        } catch (Exception e) {
            System.out.println("Authentication Manager Failure: " + e.getMessage());
            throw e;
        }

        User user = userRepository.findByEmailOrUsername(request.getEmail(), request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("User Lookup Failure for: " + request.getEmail());
                    return new IllegalArgumentException("Invalid email/username or password");
                });

        System.out.println("Login Success for User: " + user.getUsername() + " [Role: " + user.getRole() + "]");
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .role(user.getRole())
                .category(user.getCategory())
                .build();
    }
}