package com.opossum.repository;

import com.opossum.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {

    // Core operations for lost & found announcements

    /**
     * Get all files for a specific announcement
     * Used to display photos in announcement details
     */
    List<File> findByAnnouncementId(Long announcementId);

    /**
     * Get files uploaded by a specific user
     * Used for "my files" functionality
     */
    List<File> findByUploadedById(Long userId);

    /**
     * Check file ownership (security)
     * Used to verify user can delete/modify file
     */
    Optional<File> findByIdAndUploadedById(Long fileId, Long userId);

    /**
     * Basic admin statistics
     * Simple count for admin dashboard
     */
    long countByIsActiveTrue();

    /**
     * Check if file exists by Cloudinary public ID
     * Useful for avoiding duplicate uploads
     */
    boolean existsByPublicId(String publicId);
}