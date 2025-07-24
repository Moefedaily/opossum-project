package com.opossum.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.announcement.CreateAnnouncementRequest;
import com.opossum.dto.announcement.UpdateAnnouncementRequest;
import com.opossum.entity.announcement.AnnouncementCategory;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;

import jakarta.validation.constraints.NotNull;

public interface AnnouncementService {

        // Create operations
        AnnouncementDto createAnnouncement(CreateAnnouncementRequest request, Long userId);

        // Read operations
        List<AnnouncementDto> getAllAnnouncements();

        Optional<AnnouncementDto> getAnnouncementById(Long id);

        List<AnnouncementDto> getAnnouncementsByUser(Long userId);

        List<AnnouncementDto> getAnnouncementsByType(AnnouncementType type);

        List<AnnouncementDto> getAnnouncementsByStatus(AnnouncementStatus status);

        List<AnnouncementDto> getAnnouncementsByCategory(AnnouncementCategory category);

        // Update operations
        AnnouncementDto updateAnnouncement(Long id, UpdateAnnouncementRequest request, Long userId);

        AnnouncementDto updateAnnouncementStatus(Long id, AnnouncementStatus status, Long userId);

        // Delete operations
        void deleteAnnouncement(Long id, Long userId);

        void deactivateAnnouncement(Long id, Long userId);

        void activateAnnouncement(Long id, Long userId);

        // Search operations
        List<AnnouncementDto> searchAnnouncements(String searchText);

        List<AnnouncementDto> getAnnouncementsWithFilters(AnnouncementType type,
                        AnnouncementStatus status,
                        AnnouncementCategory category);

        // Date-based queries
        List<AnnouncementDto> getAnnouncementsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

        List<AnnouncementDto> getRecentAnnouncements(int limit);

        List<AnnouncementDto> getUserRecentAnnouncements(Long userId, int limit);

        // Statistics
        long getTotalAnnouncementsCount();

        long getAnnouncementsCountByType(AnnouncementType type);

        long getAnnouncementsCountByStatus(AnnouncementStatus status);

        long getUserAnnouncementsCount(Long userId);

        // Validation operations
        boolean isAnnouncementOwner(Long announcementId, Long userId);

        // Admin operations
        List<AnnouncementDto> getAllAnnouncementsForAdmin();

        void adminDeleteAnnouncement(Long id);

        AnnouncementDto adminUpdateAnnouncementStatus(Long id, AnnouncementStatus status);

        /**
         * Find active announcements within radius with optional filtering, sorted by
         * distance
         * 
         * @param latitude  User's latitude
         * @param longitude User's longitude
         * @param radiusKm  Search radius in kilometers
         * @param type      Optional filter by announcement type (LOST/FOUND)
         * @param category  Optional filter by announcement category
         * @return List of announcements within the radius matching filters, sorted by
         *         distance
         */
        List<AnnouncementDto> findNearbyAnnouncementsWithFilters(
                        @NotNull BigDecimal latitude,
                        @NotNull BigDecimal longitude,
                        @NotNull Double radiusKm,
                        AnnouncementType type,
                        AnnouncementCategory category);

        List<AnnouncementDto> findNearbyAnnouncements(
                        @NotNull BigDecimal latitude,
                        @NotNull BigDecimal longitude,
                        @NotNull Double radiusKm);

        /**
         * Find all active announcements sorted by distance *
         * 
         * @param userLatitude  User's current latitude
         * @param userLongitude User's current longitude
         * @return List of announcements sorted by distance (closest first)
         */
        List<AnnouncementDto> findAnnouncementsSortedByDistance(
                        @NotNull BigDecimal userLatitude,
                        @NotNull BigDecimal userLongitude);
}