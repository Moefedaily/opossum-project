package com.opossum.service;

import com.opossum.dto.*;
import com.opossum.dto.auth.AuthenticationResponse;
import com.opossum.dto.auth.ChangePasswordRequest;
import com.opossum.dto.auth.LoginRequest;
import com.opossum.dto.auth.RefreshTokenRequest;
import com.opossum.dto.auth.RegisterRequest;
import com.opossum.entity.User;
import com.opossum.entity.UserRole;
import com.opossum.mapper.UserMapper;
import com.opossum.repository.UserRepository;
import com.opossum.security.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserMapper userMapper;
    private final EmailService emailService; // Add email service

    // Register new user
    public Map<String, String> register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user.setRole(UserRole.USER);
        user.setIsVerified(false); // Email verification required
        user.setVerificationToken(UUID.randomUUID().toString());

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with USER role: {}", savedUser.getUsername());

        // Send verification email
        try {
            emailService.sendVerificationEmail(
                    savedUser.getEmail(),
                    savedUser.getUsername(),
                    savedUser.getVerificationToken());
            log.info("Verification email sent to: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email: {}", e.getMessage());
            userRepository.delete(savedUser);
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }

        // Return success message instead of JWT tokens
        return Map.of(
                "message", "Registration successful! Please check your email to verify your account.",
                "email", savedUser.getEmail());
    }

    // Authenticate user login
    public AuthenticationResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getLogin());

        try {
            // First, find the user to check verification status BEFORE authentication
            User user = userDetailsService.getUserEntity(request.getLogin());

            // Check if user exists (getUserEntity should throw exception if not found)
            if (user == null) {
                log.warn("Login attempt for non-existent user: {}", request.getLogin());
                throw new RuntimeException("No account found with this email or username");
            }

            // Check if email is verified BEFORE checking password
            if (!user.getIsVerified()) {
                log.warn("Login attempt with unverified email: {}", user.getEmail());
                throw new RuntimeException(
                        "Please verify your email before logging in. Check your inbox for the verification link.");
            }

            // Check if account is active
            if (!user.getIsActive()) {
                log.warn("Login attempt with inactive account: {}", user.getUsername());
                throw new RuntimeException("Your account has been deactivated. Please contact support.");
            }

            // Now authenticate user credentials (this will throw BadCredentialsException if
            // password is wrong)
            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword()));
            } catch (BadCredentialsException e) {
                log.warn("Invalid password for user: {}", request.getLogin());
                throw new RuntimeException("Invalid username or password");
            } catch (DisabledException e) {
                log.warn("Disabled account login attempt: {}", request.getLogin());
                throw new RuntimeException("Your account has been disabled. Please contact support.");
            } catch (LockedException e) {
                log.warn("Locked account login attempt: {}", request.getLogin());
                throw new RuntimeException("Your account has been locked. Please contact support.");
            }

            // Get user details from authentication
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT tokens WITH ROLE
            String accessToken = jwtService.generateToken(userDetails, user.getId(), user.getRole());
            String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId(), user.getRole());

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            log.info("User logged in successfully with role {}: {}", user.getRole(), user.getUsername());

            // Return authentication response
            return new AuthenticationResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    jwtService.getExpirationTime(),
                    userMapper.toDto(user));

        } catch (UsernameNotFoundException e) {
            log.warn("Login attempt for non-existent user: {}", request.getLogin());
            throw new RuntimeException("No account found with this email or username");
        } catch (RuntimeException e) {
            log.error("Login failed for: {} - {}", request.getLogin(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during login for: {} - {}", request.getLogin(), e.getMessage());
            throw new RuntimeException("Login failed. Please try again.");
        }
    }

    // Refresh access token
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        log.info("Refreshing access token");

        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        if (!jwtService.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Extract username from refresh token
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Check if refresh token is valid for this user
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token is not valid for this user");
        }

        // Get current user (to get updated role if changed)
        User user = userDetailsService.getUserEntity(username);

        // Generate new access token WITH ROLE
        String newAccessToken = jwtService.generateToken(userDetails, user.getId(), user.getRole());

        log.info("Access token refreshed for user with role {}: {}", user.getRole(), username);

        // Return new authentication response
        return new AuthenticationResponse(
                newAccessToken,
                jwtService.getExpirationTime(),
                userMapper.toDto(user));
    }

    // Change user password
    public void changePassword(String username, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", username);

        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);
    }

    // Verify user email
    public void verifyEmail(String token) {
        log.info("Verifying email with token: {}", token);

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        user.setIsVerified(true);
        user.setVerificationToken(null); // Clear the token
        userRepository.save(user);

        log.info("Email verified successfully for user: {}", user.getUsername());
    }

    // Resend verification email
    public void resendVerificationEmail(String email) {
        log.info("Resending verification email to: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getIsVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate new verification token
        user.setVerificationToken(UUID.randomUUID().toString());
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getUsername(),
                user.getVerificationToken());

        log.info("Verification email resent to: {}", email);
    }

    // Forgot password - send reset email
    public void forgotPassword(String email) {
        log.info("Password reset requested for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate reset token and expiration (1 hour from now)
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime resetExpires = LocalDateTime.now().plusHours(1);

        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpires(resetExpires);
        userRepository.save(user);

        // Send reset email
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getUsername(),
                resetToken);

        log.info("Password reset email sent to: {}", email);
    }

    // Reset password using token
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token: {}", token);

        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        // Check if token has expired
        if (user.getResetPasswordExpires() == null ||
                LocalDateTime.now().isAfter(user.getResetPasswordExpires())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Update password and clear reset token
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getUsername());
    }

    // Logout user (in a real app, you might blacklist the token)
    public void logout(String token) {
        log.info("User logout - token invalidated");
        // In a simple implementation, we just log the logout
        // In production, you might maintain a blacklist of tokens
    }

    // Get current user info from token
    public UserDto getCurrentUser(String token) {
        String username = jwtService.extractUsername(token);
        User user = userDetailsService.getUserEntity(username);
        return userMapper.toDto(user);
    }

    public UserRole getCurrentUserRole(String token) {
        return jwtService.extractRole(token);
    }

    public User validateResetToken(String token) {
        log.info("Validating reset token: {}", token);

        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetPasswordExpires() == null ||
                LocalDateTime.now().isAfter(user.getResetPasswordExpires())) {
            throw new RuntimeException("Reset token has expired");
        }

        return user;
    }
}