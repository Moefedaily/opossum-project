package com.opossum.repository;

import com.opossum.entity.announcement.Announcement;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;
import com.opossum.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

        // Find by basic properties
        List<Announcement> findByType(AnnouncementType type);

        List<Announcement> findByStatus(AnnouncementStatus status);

        List<Announcement> findByTypeAndStatus(AnnouncementType type, AnnouncementStatus status);

        // Find by user
        List<Announcement> findByUser(User user);

        List<Announcement> findByUserId(Long userId);

        List<Announcement> findByUserIdAndStatus(Long userId, AnnouncementStatus status);

        // Find by category
        List<Announcement> findByCategory(String category);

        List<Announcement> findByCategoryAndType(String category, AnnouncementType type);

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
                        "a.isActive = true " +
                        "ORDER BY a.createdAt DESC")
        List<Announcement> findWithFilters(@Param("type") AnnouncementType type,
                        @Param("status") AnnouncementStatus status,
                        @Param("category") String category);

        // Count methods
        long countByType(AnnouncementType type);

        long countByStatus(AnnouncementStatus status);

        long countByUserId(Long userId);

        long countByIsActiveTrue();

        // Order by created date
        List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

        // Recent announcements
        List<Announcement> findTop10ByIsActiveTrueOrderByCreatedAtDesc();

        // User's recent announcements
        List<Announcement> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}