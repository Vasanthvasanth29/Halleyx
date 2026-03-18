package com.example.workflow.service;

import com.example.workflow.dto.AuthResponse;
import com.example.workflow.dto.RegisterRequest;
import com.example.workflow.entity.Role;
import com.example.workflow.entity.User;
import com.example.workflow.repository.UserRepository;
import com.example.workflow.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private RabbitMQProducer rabbitMQProducer;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("plainPassword");
        request.setRole(Role.USER);
        request.setCategory("student_workflow");
    }

    @Test
    void testRegisterUserSuccess() {
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userDetailsService.loadUserByUsername(request.getEmail())).thenReturn(mock(UserDetails.class));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("mockToken");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mockToken");
        assertThat(response.getRole()).isEqualTo(Role.USER);
        assertThat(response.getCategory()).isEqualTo("student_workflow");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getPassword()).isEqualTo("encodedPassword");

        verify(rabbitMQProducer).sendUserRegisteredEvent(any(Map.class));
    }

    @Test
    void testRegisterUserDuplicateEmail() {
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        IllegalArgumentException thrown = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );

        assertThat(thrown.getMessage()).isEqualTo("Email is already taken");
        verify(userRepository, never()).save(any(User.class));
        verify(rabbitMQProducer, never()).sendUserRegisteredEvent(any());
    }

    @Test
    void testPasswordEncryption() {
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("superSecretHash");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(mock(UserDetails.class));
        when(jwtUtil.generateToken(any())).thenReturn("token");

        authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("superSecretHash");
    }
}
