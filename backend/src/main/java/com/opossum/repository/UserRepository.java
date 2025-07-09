package com.opossum.repository;

import com.opossum.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find by username
    Optional<User> findByUsername(String username);

    // Find by email
    Optional<User> findByEmail(String email);

    // Check if username exists
    boolean existsByUsername(String username);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find by verification token
    Optional<User> findByVerificationToken(String token);

    // Find by reset password token
    Optional<User> findByResetPasswordToken(String token);

    // Find active users
    List<User> findByIsActiveTrue();

    // Find verified users
    List<User> findByIsVerifiedTrue();

    // Count active users
    long countByIsActiveTrue();

    // Count verified users
    long countByIsVerifiedTrue();
}