package com.opossum.service;

import com.opossum.dto.UserDto;
import com.opossum.dto.UserStatsDto;
import com.opossum.dto.auth.CreateUserRequest;
import com.opossum.entity.User;
import com.opossum.entity.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserService {

    // Create operations
    UserDto createUser(CreateUserRequest request);

    // Read operations
    List<UserDto> getAllUsers();

    Optional<UserDto> getUserById(Long id);

    Optional<UserDto> getUserByUsername(String username);

    Optional<UserDto> getUserByEmail(String email);

    Optional<User> findUserForAuthentication(String login);

    // Update operations
    UserDto updateUser(Long id, UserDto userDto);

    UserDto updateUserProfile(Long id, String firstName, String lastName, String phone);

    void updateLastLogin(Long userId);

    // Delete operations
    void deleteUser(Long id);

    void deactivateUser(Long id);

    void activateUser(Long id);

    // Validation operations
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Search operations
    List<UserDto> getActiveUsers();

    List<UserDto> getVerifiedUsers();

    // Statistics
    long getTotalUserCount();

    long getActiveUserCount();

    long getVerifiedUserCount();

    // Role management
    UserDto assignRole(Long userId, UserRole role);

    List<UserDto> getUsersByRole(UserRole role);

    UserStatsDto getUserStats(Long userId);

}