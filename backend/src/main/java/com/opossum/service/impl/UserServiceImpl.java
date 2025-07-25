package com.opossum.service.impl;

import com.opossum.dto.UserDto;
import com.opossum.dto.UserStatsDto;
import com.opossum.dto.auth.CreateUserRequest;
import com.opossum.entity.User;
import com.opossum.entity.UserRole;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.mapper.UserMapper;
import com.opossum.repository.AnnouncementRepository;
import com.opossum.repository.UserRepository;
import com.opossum.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AnnouncementRepository announcementRepository;

    @Override
    public UserDto createUser(CreateUserRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());

        // Check if username already exists
        if (existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Create new user entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(UserRole.ADMIN);
        user.setIsActive(true);
        user.setIsVerified(true);
        user.setVerificationToken(UUID.randomUUID().toString());

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserById(Long id) {
        log.debug("Fetching user by ID: {}", id);
        return userRepository.findById(id)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByUsername(String username) {
        log.debug("Fetching user by username: {}", username);
        return userRepository.findByUsername(username)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        return userRepository.findByEmail(email)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserForAuthentication(String login) {
        log.debug("Finding user for authentication with login: {}", login);

        // Try to find by username first
        Optional<User> userByUsername = userRepository.findByUsername(login);
        if (userByUsername.isPresent()) {
            return userByUsername;
        }

        // If not found by username, try by email
        return userRepository.findByEmail(login);
    }

    @Override
    public UserDto updateUser(Long id, UserDto userDto) {
        log.info("Updating user with ID: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Update fields (excluding password and sensitive data)
        existingUser.setFirstName(userDto.getFirstName());
        existingUser.setLastName(userDto.getLastName());
        existingUser.setPhone(userDto.getPhone());
        existingUser.setAvatarUrl(userDto.getAvatarUrl());

        User updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return userMapper.toDto(updatedUser);
    }

    @Override
    public UserDto updateUserProfile(Long id, String firstName, String lastName, String phone) {
        log.info("Updating user profile for ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Override
    public void updateLastLogin(Long userId) {
        log.debug("Updating last login for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }

        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }

    @Override
    public void deactivateUser(Long id) {
        log.info("Deactivating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("User deactivated successfully with ID: {}", id);
    }

    @Override
    public void activateUser(Long id) {
        log.info("Activating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setIsActive(true);
        userRepository.save(user);
        log.info("User activated successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getActiveUsers() {
        log.debug("Fetching active users");
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getVerifiedUsers() {
        log.debug("Fetching verified users");
        return userRepository.findByIsVerifiedTrue()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalUserCount() {
        return userRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long getActiveUserCount() {
        return userRepository.countByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public long getVerifiedUserCount() {
        return userRepository.countByIsVerifiedTrue();
    }

    @Override
    public UserDto assignRole(Long userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);

    }

    @Override
    public List<UserDto> getUsersByRole(UserRole role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserStatsDto getUserStats(Long userId) {
        log.info("Getting user statistics for user ID: {}", userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.debug("User found: {}", user.getUsername());

        // Count announcements by status
        Long totalAnnouncements = announcementRepository.countByUserId(userId);
        Long activeAnnouncements = announcementRepository.countByUserIdAndStatus(userId, AnnouncementStatus.ACTIVE);
        Long resolvedAnnouncements = announcementRepository.countByUserIdAndStatus(userId, AnnouncementStatus.RESOLVED);
        Long expiredAnnouncements = announcementRepository.countByUserIdAndStatus(userId, AnnouncementStatus.ARCHIVED);

        return UserStatsDto.builder()
                .totalAnnouncements(totalAnnouncements)
                .activeAnnouncements(activeAnnouncements)
                .resolvedAnnouncements(resolvedAnnouncements)
                .expiredAnnouncements(expiredAnnouncements)
                .build();
    }

}