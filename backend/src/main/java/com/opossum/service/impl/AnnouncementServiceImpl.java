package com.opossum.service.impl;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.announcement.CreateAnnouncementRequest;
import com.opossum.dto.announcement.UpdateAnnouncementRequest;
import com.opossum.entity.announcement.Announcement;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;
import com.opossum.entity.User;
import com.opossum.mapper.AnnouncementMapper;
import com.opossum.repository.AnnouncementRepository;
import com.opossum.repository.UserRepository;
import com.opossum.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final AnnouncementMapper announcementMapper;

    @Override
    public AnnouncementDto createAnnouncement(CreateAnnouncementRequest request, Long userId) {
        log.info("Creating announcement for user ID: {}", userId);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Convert request to entity
        Announcement announcement = announcementMapper.toEntity(request, user);

        // Save announcement
        Announcement savedAnnouncement = announcementRepository.save(announcement);

        log.info("Announcement created successfully with ID: {}", savedAnnouncement.getId());
        return announcementMapper.toDto(savedAnnouncement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllAnnouncements() {
        log.debug("Getting all active announcements");
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AnnouncementDto> getAnnouncementById(Long id) {
        log.debug("Getting announcement by ID: {}", id);
        Optional<Announcement> announcement = announcementRepository.findById(id);
        return announcement.map(announcementMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsByUser(Long userId) {
        log.debug("Getting announcements for user ID: {}", userId);
        List<Announcement> announcements = announcementRepository.findByUserId(userId);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsByType(AnnouncementType type) {
        log.debug("Getting announcements by type: {}", type);
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueAndType(type);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsByStatus(AnnouncementStatus status) {
        log.debug("Getting announcements by status: {}", status);
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueAndStatus(status);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsByCategory(String category) {
        log.debug("Getting announcements by category: {}", category);
        List<Announcement> announcements = announcementRepository.findByCategoryAndType(category, null);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    public AnnouncementDto updateAnnouncement(Long id, UpdateAnnouncementRequest request, Long userId) {
        log.info("Updating announcement ID: {} by user ID: {}", id, userId);

        // Find announcement
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        // Check ownership
        if (!isAnnouncementOwner(id, userId)) {
            throw new RuntimeException("User not authorized to update this announcement");
        }

        // Update announcement
        announcementMapper.updateEntity(announcement, request);
        Announcement updatedAnnouncement = announcementRepository.save(announcement);

        log.info("Announcement updated successfully with ID: {}", updatedAnnouncement.getId());
        return announcementMapper.toDto(updatedAnnouncement);
    }

    @Override
    public AnnouncementDto updateAnnouncementStatus(Long id, AnnouncementStatus status, Long userId) {
        log.info("Updating announcement status to {} for ID: {} by user ID: {}", status, id, userId);

        // Find announcement
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        // Check ownership
        if (!isAnnouncementOwner(id, userId)) {
            throw new RuntimeException("User not authorized to update this announcement");
        }

        // Update status
        announcement.setStatus(status);
        Announcement updatedAnnouncement = announcementRepository.save(announcement);

        log.info("Announcement status updated successfully for ID: {}", updatedAnnouncement.getId());
        return announcementMapper.toDto(updatedAnnouncement);
    }

    @Override
    public void deleteAnnouncement(Long id, Long userId) {
        log.info("Deleting announcement ID: {} by user ID: {}", id, userId);

        // Find announcement
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        // Check ownership
        if (!isAnnouncementOwner(id, userId)) {
            throw new RuntimeException("User not authorized to delete this announcement");
        }

        // Delete announcement
        announcementRepository.delete(announcement);
        log.info("Announcement deleted successfully with ID: {}", id);
    }

    @Override
    public void deactivateAnnouncement(Long id, Long userId) {
        log.info("Deactivating announcement ID: {} by user ID: {}", id, userId);

        // Check ownership first
        if (!isAnnouncementOwner(id, userId)) {
            throw new RuntimeException("User not authorized to deactivate this announcement");
        }

        // Find announcement
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        // Deactivate announcement
        announcement.setIsActive(false);
        announcementRepository.save(announcement);
        log.info("Announcement deactivated successfully with ID: {}", id);
    }

    @Override
    public void activateAnnouncement(Long id, Long userId) {
        log.info("Activating announcement ID: {} by user ID: {}", id, userId);

        // Find announcement
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        // Check ownership
        if (!isAnnouncementOwner(id, userId)) {
            throw new RuntimeException("User not authorized to update this announcement");
        }

        // Activate announcement
        announcement.setIsActive(true);
        announcementRepository.save(announcement);
        log.info("Announcement activated successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> searchAnnouncements(String searchText) {
        log.debug("Searching announcements with text: {}", searchText);
        List<Announcement> announcements = announcementRepository.searchByText(searchText);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsWithFilters(AnnouncementType type,
            AnnouncementStatus status,
            String category) {
        log.debug("Getting announcements with filters - type: {}, status: {}, category: {}", type, status, category);
        List<Announcement> announcements = announcementRepository.findWithFilters(type, status, category);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Getting announcements by date range: {} to {}", startDate, endDate);
        List<Announcement> announcements = announcementRepository.findByCreatedAtBetween(startDate, endDate);
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getRecentAnnouncements(int limit) {
        log.debug("Getting {} recent announcements", limit);
        List<Announcement> announcements = announcementRepository.findTop10ByIsActiveTrueOrderByCreatedAtDesc();
        return announcementMapper.toDtoList(announcements.stream().limit(limit).toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getUserRecentAnnouncements(Long userId, int limit) {
        log.debug("Getting {} recent announcements for user ID: {}", limit, userId);
        List<Announcement> announcements = announcementRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        return announcementMapper.toDtoList(announcements.stream().limit(limit).toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalAnnouncementsCount() {
        return announcementRepository.countByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public long getAnnouncementsCountByType(AnnouncementType type) {
        return announcementRepository.countByType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public long getAnnouncementsCountByStatus(AnnouncementStatus status) {
        return announcementRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUserAnnouncementsCount(Long userId) {
        return announcementRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAnnouncementOwner(Long announcementId, Long userId) {
        Optional<Announcement> announcement = announcementRepository.findById(announcementId);
        return announcement.isPresent() && announcement.get().getUser().getId().equals(userId);
    }

    // Admin operations
    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllAnnouncementsForAdmin() {
        log.debug("Getting all announcements for admin");
        List<Announcement> announcements = announcementRepository.findAll();
        return announcementMapper.toDtoList(announcements);
    }

    @Override
    public void adminDeleteAnnouncement(Long id) {
        log.info("Admin deleting announcement ID: {}", id);
        announcementRepository.deleteById(id);
        log.info("Announcement deleted by admin with ID: {}", id);
    }

    @Override
    public AnnouncementDto adminUpdateAnnouncementStatus(Long id, AnnouncementStatus status) {
        log.info("Admin updating announcement status to {} for ID: {}", status, id);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + id));

        announcement.setStatus(status);
        Announcement updatedAnnouncement = announcementRepository.save(announcement);

        log.info("Announcement status updated by admin for ID: {}", updatedAnnouncement.getId());
        return announcementMapper.toDto(updatedAnnouncement);
    }
}