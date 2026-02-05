package com.example.ecom.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .authorizeHttpRequests(auth -> auth
            .anyRequest().permitAll()
        )
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, e) -> {
                res.setStatus(401);
                res.setContentType("application/json");
                res.getWriter().write("{\"error\":\"Unauthorized\"}");
            })
        )
        .sessionManagement(session ->
            session.sessionCreationPolicy(
                org.springframework.security.config.http.SessionCreationPolicy.STATELESS
            )
        );

    return http.build();
}
}