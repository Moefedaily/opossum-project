package com.opossum.config;

import com.opossum.security.JwtAuthenticationFilter;
import com.opossum.util.Argon2idPasswordEncoder;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enable method-level security
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2idPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/verify-email").permitAll()
                        .requestMatchers("/api/auth/verify-email-redirect").permitAll()
                        .requestMatchers("/api/auth/forgot-password").permitAll()
                        .requestMatchers("/api/auth/reset-password").permitAll()
                        .requestMatchers("/api/auth/reset-password-redirect").permitAll()
                        .requestMatchers("/api/auth/resend-verification").permitAll()

                        // Health check
                        .requestMatchers("/actuator/health").permitAll()

                        // Swagger documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Public announcement viewing (lost & found browsing)
                        .requestMatchers("GET", "/api/announcements").permitAll()
                        .requestMatchers("GET", "/api/announcements/*").permitAll()
                        .requestMatchers("GET", "/api/announcements/recent").permitAll()
                        .requestMatchers("GET", "/api/announcements/stats").permitAll()

                        // Public file viewing (photos in lost & found announcements)
                        .requestMatchers("GET", "/api/files/{id}").permitAll()
                        .requestMatchers("GET", "/api/files/announcement/*").permitAll()
                        .requestMatchers("GET", "/api/announcements/nearby").permitAll()

                        // Public categories (dropdown values)
                        .requestMatchers("GET", "/api/categories").permitAll()

                        // User endpoints (both USER and ADMIN)
                        .requestMatchers("/api/auth/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/auth/change-password").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/auth/logout").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/auth/refresh").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("DELETE", "/api/users/**").hasAnyRole("USER", "ADMIN")

                        // ADD THESE USER PROFILE ENDPOINTS:
                        .requestMatchers("GET", "/api/users/*").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("PATCH", "/api/users/*/profile").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("GET", "/api/users/*/stats").hasAnyRole("USER", "ADMIN")

                        // Announcement management (create, update, delete)
                        .requestMatchers("POST", "/api/announcements").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("PUT", "/api/announcements/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("PATCH", "/api/announcements/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("DELETE", "/api/announcements/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/announcements/my").hasAnyRole("USER", "ADMIN")

                        // File management (upload, delete own files)
                        .requestMatchers("POST", "/api/files/upload").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("POST", "/api/files/upload-multiple").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("GET", "/api/files/my").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("DELETE", "/api/files/*").hasAnyRole("USER", "ADMIN")

                        // Messaging (when implemented)
                        .requestMatchers("/api/conversations/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/messages/**").hasAnyRole("USER", "ADMIN")

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users").hasRole("ADMIN")
                        .requestMatchers("PUT", "/api/users/*").hasRole("ADMIN")
                        .requestMatchers("POST", "/api/users").hasRole("ADMIN")
                        .requestMatchers("/api/files/admin/**").hasRole("ADMIN")
                        .requestMatchers("PATCH", "/api/users/*/deactivate").hasRole("ADMIN")
                        .requestMatchers("PATCH", "/api/users/*/activate").hasRole("ADMIN")
                        .requestMatchers("PATCH", "/api/users/*/role").hasRole("ADMIN")
                        .requestMatchers("/api/announcements/admin/**").hasRole("ADMIN")
                        // All other requests require authentication
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}