package com.opossum.repository;

import com.opossum.entity.announcement.Announcement;
import com.opossum.entity.announcement.AnnouncementCategory;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;
import com.opossum.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

        // Find by properties
        List<Announcement> findByType(AnnouncementType type);

        List<Announcement> findByStatus(AnnouncementStatus status);

        List<Announcement> findByTypeAndStatus(AnnouncementType type, AnnouncementStatus status);

        // Find by user
        List<Announcement> findByUser(User user);

        List<Announcement> findByUserId(Long userId);

        List<Announcement> findByUserIdAndStatus(Long userId, AnnouncementStatus status);

        // Find by category
        List<Announcement> findByCategory(AnnouncementCategory category);

        List<Announcement> findByCategoryAndType(AnnouncementCategory category, AnnouncementType type);

        // Find by active status
        List<Announcement> findByIsActiveTrue();

        List<Announcement> findByIsActiveTrueAndStatus(AnnouncementStatus status);

        List<Announcement> findByIsActiveTrueAndType(AnnouncementType type);

        // Find by date range
        List<Announcement> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

        List<Announcement> findByIncidentDateBetween(LocalDateTime start, LocalDateTime end);

        // Search by text (title or description)
        @Query("SELECT a FROM Announcement a WHERE " +
                        "(LOWER(a.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
                        "LOWER(a.description) LIKE LOWER(CONCAT('%', :searchText, '%'))) AND " +
                        "a.isActive = true")
        List<Announcement> searchByText(@Param("searchText") String searchText);

        // Search with filters
        @Query("SELECT a FROM Announcement a WHERE " +
                        "(:type IS NULL OR a.type = :type) AND " +
                        "(:status IS NULL OR a.status = :status) AND " +
                        "(:category IS NULL OR a.category = :category) AND " +
                        "a.isActive = true AND " +
                        "a.status = 'ACTIVE' " +
                        "ORDER BY a.createdAt DESC")
        List<Announcement> findWithFilters(@Param("type") AnnouncementType type,
                        @Param("status") AnnouncementStatus status,
                        @Param("category") AnnouncementCategory category);

        List<Announcement> findByIsActiveTrueAndStatusOrderByCreatedAtDesc(AnnouncementStatus status);

        // Count methods
        long countByType(AnnouncementType type);

        long countByStatus(AnnouncementStatus status);

        long countByUserId(Long userId);

        long countByUserIdAndStatus(Long userId, AnnouncementStatus status);

        long countByUserIdAndIsActive(Long userId, boolean isActive);

        long countByIsActiveTrue();

        // Order by created date
        List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

        // Recent announcements
        List<Announcement> findTop10ByIsActiveTrueOrderByCreatedAtDesc();

        // User's recent announcements
        List<Announcement> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

        /**
         * Find announcements with GPS coordinates within bounding box
         * This is more efficient than calculating distance for every record
         * 
         * @param minLat Minimum latitude (south boundary)
         * @param maxLat Maximum latitude (north boundary)
         * @param minLng Minimum longitude (west boundary)
         * @param maxLng Maximum longitude (east boundary)
         * @return List of announcements within the bounding box
         */
        @Query("SELECT a FROM Announcement a WHERE " +
                        "a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND " +
                        "a.latitude BETWEEN :minLat AND :maxLat AND " +
                        "a.longitude BETWEEN :minLng AND :maxLng AND " +
                        "a.isActive = true " +
                        "ORDER BY a.createdAt DESC")
        List<Announcement> findWithinBoundingBox(@Param("minLat") BigDecimal minLat,
                        @Param("maxLat") BigDecimal maxLat,
                        @Param("minLng") BigDecimal minLng,
                        @Param("maxLng") BigDecimal maxLng);

        /**
         * Find announcements with GPS coordinates within bounding box with optional
         * filters
         * 
         * @param minLat   Minimum latitude (south boundary)
         * @param maxLat   Maximum latitude (north boundary)
         * @param minLng   Minimum longitude (west boundary)
         * @param maxLng   Maximum longitude (east boundary)
         * @param type     Optional filter by announcement type
         * @param category Optional filter by announcement category
         * @return List of announcements within the bounding box matching filters
         */
        @Query("SELECT a FROM Announcement a WHERE " +
                        "a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND " +
                        "a.latitude BETWEEN :minLat AND :maxLat AND " +
                        "a.longitude BETWEEN :minLng AND :maxLng AND " +
                        "a.isActive = true AND " +
                        "a.status = 'ACTIVE' AND " +
                        "(:type IS NULL OR a.type = :type) AND " +
                        "(:category IS NULL OR a.category = :category) " +
                        "ORDER BY a.createdAt DESC")
        List<Announcement> findWithinBoundingBoxWithFilters(
                        @Param("minLat") BigDecimal minLat,
                        @Param("maxLat") BigDecimal maxLat,
                        @Param("minLng") BigDecimal minLng,
                        @Param("maxLng") BigDecimal maxLng,
                        @Param("type") AnnouncementType type,
                        @Param("category") AnnouncementCategory category);

        /**
         * Find all active announcements that have GPS coordinates
         * 
         * @return List of announcements with valid GPS coordinates
         */
        @Query("SELECT a FROM Announcement a WHERE " +
                        "a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND " +
                        "a.isActive = true " +
                        "ORDER BY a.createdAt DESC")
        List<Announcement> findAllWithGpsCoordinates();
}