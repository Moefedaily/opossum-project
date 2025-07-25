package com.opossum.controller;

import com.opossum.dto.UserDto;
import com.opossum.dto.UserStatsDto;
import com.opossum.dto.auth.CreateUserRequest;
import com.opossum.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "Operations for managing users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user", description = "Creates a new user account with validation")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        try {
            UserDto createdUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieves a list of all users with optional filtering")
    public ResponseEntity<List<UserDto>> getAllUsers(
            @Parameter(description = "Filter by active status") @RequestParam(value = "active", required = false) Boolean active,
            @Parameter(description = "Filter by verified status") @RequestParam(value = "verified", required = false) Boolean verified) {

        log.debug("Fetching users - active: {}, verified: {}", active, verified);

        List<UserDto> users;

        if (Boolean.TRUE.equals(active)) {
            users = userService.getActiveUsers();
        } else if (Boolean.TRUE.equals(verified)) {
            users = userService.getVerifiedUsers();
        } else {
            users = userService.getAllUsers();
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves a specific user by their ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        log.debug("Fetching user by ID: {}", id);

        Optional<UserDto> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with ID: " + id));
        }
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get user by username", description = "Retrieves a user by their username")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        log.debug("Fetching user by username: {}", username);

        Optional<UserDto> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with username: " + username));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile", description = "Updates user profile information")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        log.info("Updating user with ID: {}", id);

        try {
            UserDto updatedUser = userService.updateUser(id, userDto);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/profile")
    @Operation(summary = "Update user profile details", description = "Updates only profile information")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> profileData) {

        log.info("Updating profile for user ID: {}", id);

        try {
            String firstName = profileData.get("firstName");
            String lastName = profileData.get("lastName");
            String phone = profileData.get("phone");

            UserDto updatedUser = userService.updateUserProfile(id, firstName, lastName, phone);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate user", description = "Activates a deactivated user account")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        log.info("Activating user with ID: {}", id);

        try {
            userService.activateUser(id);
            return ResponseEntity.ok(Map.of("message", "User activated successfully"));
        } catch (RuntimeException e) {
            log.error("Error activating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate user", description = "Deactivates a user account")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        log.info("Deactivating user with ID: {}", id);

        try {
            userService.deactivateUser(id);
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
        } catch (RuntimeException e) {
            log.error("Error deactivating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Permanently deletes a user account")
    @ApiResponse(responseCode = "204", description = "User deleted successfully")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);

        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user statistics", description = "Returns user count statistics")
    public ResponseEntity<Map<String, Long>> getUserStats() {
        log.debug("Fetching user statistics");

        Map<String, Long> stats = Map.of(
                "totalUsers", userService.getTotalUserCount(),
                "activeUsers", userService.getActiveUserCount(),
                "verifiedUsers", userService.getVerifiedUserCount());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/check-availability")
    @Operation(summary = "Check username/email availability", description = "Checks if username or email is available")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email) {

        Map<String, Boolean> availability = Map.of(
                "usernameAvailable", username == null || !userService.existsByUsername(username),
                "emailAvailable", email == null || !userService.existsByEmail(email));

        return ResponseEntity.ok(availability);
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get user statistics", description = "Gets user's announcement statistics")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<?> getUserStats(@PathVariable Long id) {
        log.info("Getting statistics for user ID: {}", id);
        try {
            UserStatsDto stats = userService.getUserStats(id);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            log.error("Error getting user statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}