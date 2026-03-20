//package com.example.workflow.config;
//
//import com.example.workflow.repository.UserRepository;
//import com.example.workflow.security.JwtAuthenticationFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//
//import java.util.Collections;
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final UserRepository userRepository;
//
//    @Bean
//    public UserDetailsService userDetailsService() {
//        return identifier -> {
//            var user = userRepository.findByEmailOrUsername(identifier, identifier)
//                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
//
//            return new org.springframework.security.core.userdetails.User(
//                    user.getEmail(),
//                    user.getPassword(),
//                    Collections.singleton(
//                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
//                    )
//            );
//        };
//    }
//
//    @Bean
//    public AuthenticationProvider authenticationProvider() {
//        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//        authProvider.setUserDetailsService(userDetailsService());
//        authProvider.setPasswordEncoder(passwordEncoder());
//        return authProvider;
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(
//            AuthenticationConfiguration config) throws Exception {
//        return config.getAuthenticationManager();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(
//            HttpSecurity http,
//            JwtAuthenticationFilter jwtAuthFilter
//    ) throws Exception {
//
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//
//                .cors(cors -> cors.configurationSource(request -> {
//                    CorsConfiguration config = new CorsConfiguration();
//                    config.setAllowedOriginPatterns(List.of("*"));
//                    config.setAllowedMethods(List.of(
//                            "GET", "POST", "PUT", "DELETE", "OPTIONS"
//                    ));
//                    config.setAllowedHeaders(List.of("*"));
//                    config.setAllowCredentials(true);
//                    return config;
//                }))
//
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        .requestMatchers("/auth/**").permitAll()
//                        .requestMatchers("/error").permitAll()
//                        .requestMatchers("/api/admin/**").permitAll()
//                        .anyRequest().authenticated()
//                )
//
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authenticationProvider(authenticationProvider())
//
//                .addFilterBefore(jwtAuthFilter,
//                        UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}


package com.example.workflow.config;

import com.example.workflow.repository.UserRepository;
import com.example.workflow.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Collections;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.security.enabled", havingValue = "true", matchIfMissing = false)
public class SecurityConfig {
    @Autowired
    private UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return identifier -> {
            var user = userRepository.findByEmailOrUsername(identifier, identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    Collections.singleton(
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    )
            );
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public SecurityFilterChain securityFilterChain(
//            HttpSecurity http,
//            JwtAuthenticationFilter jwtAuthFilter
//    ) throws Exception {
//
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//
//                .cors(cors -> cors.configurationSource(request -> {
//                    CorsConfiguration config = new CorsConfiguration();
//                    config.setAllowedOriginPatterns(List.of("*"));
//                    config.setAllowedMethods(List.of(
//                            "GET", "POST", "PUT", "DELETE", "OPTIONS"
//                    ));
//                    config.setAllowedHeaders(List.of("*"));
//                    config.setAllowCredentials(true);
//                    return config;
//                }))
//
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                        .requestMatchers("/auth/**").permitAll()
//                        .requestMatchers("/error").permitAll()
//
//                        // 🔥 MAIN FIX
//                        .requestMatchers("/api/admin/**").permitAll()
//
//                        .anyRequest().authenticated()
//                )
//
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authenticationProvider(authenticationProvider())
//
//                .addFilterBefore(jwtAuthFilter,
//                        UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter
    ) throws Exception {

        http
                // ❌ disable csrf
                .csrf(AbstractHttpConfigurer::disable)

                // ✅ CORS config
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOriginPatterns(List.of("*"));
                    config.setAllowedMethods(List.of(
                            "GET", "POST", "PUT", "DELETE", "OPTIONS"
                    ));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                // ✅ AUTH RULES
                .authorizeHttpRequests(auth -> auth

                        // preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // public endpoints
                        .requestMatchers("/", "/error").permitAll()   // 🔥 FIXED
                        .requestMatchers("/auth/**").permitAll()

                        // admin (temporary open - later secure panna)
                        .requestMatchers("/api/admin/**").permitAll()

                        // everything else secured
                        .anyRequest().authenticated()
                )

                // ✅ stateless (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ✅ auth provider
                .authenticationProvider(authenticationProvider())

                // ✅ JWT filter
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JavaMailSender emailSender() {
        return new JavaMailSenderImpl();
    }
}