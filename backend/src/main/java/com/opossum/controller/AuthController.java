package com.opossum.controller;

import com.opossum.dto.*;
import com.opossum.dto.auth.AuthenticationResponse;
import com.opossum.dto.auth.ChangePasswordRequest;
import com.opossum.dto.auth.LoginRequest;
import com.opossum.dto.auth.RefreshTokenRequest;
import com.opossum.dto.auth.RegisterRequest;
import com.opossum.dto.auth.ResetPasswordRequest;
import com.opossum.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account and returns JWT tokens")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for username: {}", request.getUsername());

        try {
            Map<String, String> response = authenticationService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user and returns JWT tokens")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for: {}", request.getLogin());

        try {
            AuthenticationResponse response = authenticationService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Gets a new access token using refresh token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request");

        try {
            AuthenticationResponse response = authenticationService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Changes the current user's password")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid current password"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("Password change request for user: {}", username);

        try {
            authenticationService.changePassword(username, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            log.error("Password change failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verifies user email using verification token")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        log.info("Email verification request with token: {}", token);
        try {
            authenticationService.verifyEmail(token);
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        } catch (RuntimeException e) {
            log.error("Email verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logs out the current user")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("Logout request");

        try {
            // Extract token from "Bearer <token>"
            String token = authHeader.substring(7);
            authenticationService.logout(token);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Logout failed"));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns current authenticated user information")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        log.debug("Get current user request");

        try {
            // Extract token from "Bearer <token>"
            String token = authHeader.substring(7);
            UserDto user = authenticationService.getCurrentUser(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Get current user failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate token", description = "Validates if the provided JWT token is valid")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        log.debug("Token validation request");

        try {
            // Extract token from "Bearer <token>"
            String token = authHeader.substring(7);
            UserDto user = authenticationService.getCurrentUser(token);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "user", user));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Validate password confirmation
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Passwords do not match"));
            }

            authenticationService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok()
                    .body(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resends email verification to user")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            authenticationService.resendVerificationEmail(email);
            return ResponseEntity.ok()
                    .body(Map.of("message", "Verification email sent successfully"));
        } catch (Exception e) {
            log.error("Error resending verification email: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Sends password reset email to user")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            authenticationService.forgotPassword(email);
            return ResponseEntity.ok()
                    .body(Map.of("message", "Password reset email sent successfully"));
        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-email-redirect")
    public ResponseEntity<?> handleEmailVerificationRedirect(@RequestParam("token") String token) {
        try {
            authenticationService.verifyEmail(token);

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(
                    "exp://ly-do5w-moefedaily-8081.exp.direct/--/verify-success?status=success&message=Email verified successfully"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(
                    URI.create("exp://ly-do5w-moefedaily-8081.exp.direct/--/verify-success?status=error&message="
                            + e.getMessage()));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    @GetMapping("/reset-password-redirect")
    public ResponseEntity<?> handlePasswordResetRedirect(@RequestParam("token") String token) {
        try {
            authenticationService.validateResetToken(token);

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(
                    URI.create("exp://ly-do5w-moefedaily-8081.exp.direct/--/reset-password?token=" + token));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(
                    URI.create("exp://ly-do5w-moefedaily-8081.exp.direct/--/reset-password?status=error&message="
                            + e.getMessage()));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

}