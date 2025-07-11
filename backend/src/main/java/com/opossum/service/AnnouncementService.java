package com.opossum.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.announcement.CreateAnnouncementRequest;
import com.opossum.dto.announcement.UpdateAnnouncementRequest;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;

public interface AnnouncementService {

    // Create operations
    AnnouncementDto createAnnouncement(CreateAnnouncementRequest request, Long userId);

    // Read operations
    List<AnnouncementDto> getAllAnnouncements();

    Optional<AnnouncementDto> getAnnouncementById(Long id);

    List<AnnouncementDto> getAnnouncementsByUser(Long userId);

    List<AnnouncementDto> getAnnouncementsByType(AnnouncementType type);

    List<AnnouncementDto> getAnnouncementsByStatus(AnnouncementStatus status);

    List<AnnouncementDto> getAnnouncementsByCategory(String category);

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
            String category);

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
}