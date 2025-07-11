package com.opossum.service;

import com.opossum.dto.*;
import com.opossum.entity.User;
import com.opossum.mapper.UserMapper;
import com.opossum.repository.UserRepository;
import com.opossum.security.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // Register new user
    public AuthenticationResponse register(RegisterRequest request) {
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
        user.setIsVerified(false); // Email verification required
        user.setVerificationToken(UUID.randomUUID().toString());

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());

        // Generate JWT tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Update last login
        savedUser.setLastLogin(LocalDateTime.now());
        userRepository.save(savedUser);

        // Return authentication response
        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationTime(),
                userMapper.toDto(savedUser));
    }

    // Authenticate user login
    public AuthenticationResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getLogin());

        // Authenticate user credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword()));

        // Get user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userDetailsService.getUserEntity(request.getLogin());

        // Generate JWT tokens
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in successfully: {}", user.getUsername());

        // Return authentication response
        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationTime(),
                userMapper.toDto(user));
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

        // Generate new access token
        String newAccessToken = jwtService.generateToken(userDetails);
        User user = userDetailsService.getUserEntity(username);

        log.info("Access token refreshed for user: {}", username);

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
}