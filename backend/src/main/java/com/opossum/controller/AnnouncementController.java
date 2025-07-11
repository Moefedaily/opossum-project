package com.opossum.controller;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.announcement.CreateAnnouncementRequest;
import com.opossum.dto.announcement.UpdateAnnouncementRequest;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;
import com.opossum.service.AnnouncementService;
import com.opossum.service.JwtService;
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
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Announcements", description = "Lost & Found announcements management")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final JwtService jwtService;

    @PostMapping
    @Operation(summary = "Create announcement", description = "Create a new lost or found item announcement")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Announcement created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<?> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7); // Remove "Bearer "
            Long userId = jwtService.extractUserId(token);

            AnnouncementDto announcement = announcementService.createAnnouncement(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(announcement);

        } catch (Exception e) {
            log.error("Error creating announcement: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get all announcements", description = "Get all active announcements with optional filtering")
    public ResponseEntity<?> getAllAnnouncements(
            @Parameter(description = "Filter by announcement type") @RequestParam(required = false) AnnouncementType type,
            @Parameter(description = "Filter by announcement status") @RequestParam(required = false) AnnouncementStatus status,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Search in title and description") @RequestParam(required = false) String search) {

        try {
            List<AnnouncementDto> announcements;

            if (search != null && !search.trim().isEmpty()) {
                announcements = announcementService.searchAnnouncements(search);
            } else if (type != null || status != null || category != null) {
                announcements = announcementService.getAnnouncementsWithFilters(type, status, category);
            } else {
                announcements = announcementService.getAllAnnouncements();
            }

            return ResponseEntity.ok(announcements);

        } catch (Exception e) {
            log.error("Error getting announcements: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get announcement by ID", description = "Get specific announcement details")
    public ResponseEntity<?> getAnnouncementById(@PathVariable Long id) {
        try {
            Optional<AnnouncementDto> announcement = announcementService.getAnnouncementById(id);

            if (announcement.isPresent()) {
                return ResponseEntity.ok(announcement.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting announcement by ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @Operation(summary = "Get my announcements", description = "Get current user's announcements")
    public ResponseEntity<?> getMyAnnouncements(
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<AnnouncementDto> announcements = announcementService.getAnnouncementsByUser(userId);
            return ResponseEntity.ok(announcements);

        } catch (Exception e) {
            log.error("Error getting user announcements: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update announcement", description = "Update announcement details (owner only)")
    public ResponseEntity<?> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAnnouncementRequest request,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            AnnouncementDto updatedAnnouncement = announcementService.updateAnnouncement(id, request, userId);
            return ResponseEntity.ok(updatedAnnouncement);

        } catch (Exception e) {
            log.error("Error updating announcement {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update announcement status", description = "Update announcement status (owner only)")
    public ResponseEntity<?> updateAnnouncementStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            // Parse status
            AnnouncementStatus status = AnnouncementStatus.valueOf(statusUpdate.get("status"));

            AnnouncementDto updatedAnnouncement = announcementService.updateAnnouncementStatus(id, status, userId);
            return ResponseEntity.ok(updatedAnnouncement);

        } catch (Exception e) {
            log.error("Error updating announcement status {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete announcement", description = "Delete announcement (owner only)")
    public ResponseEntity<?> deleteAnnouncement(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            announcementService.deleteAnnouncement(id, userId);
            return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));

        } catch (Exception e) {
            log.error("Error deleting announcement {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate announcement", description = "Deactivate announcement (owner only)")
    public ResponseEntity<?> deactivateAnnouncement(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            announcementService.deactivateAnnouncement(id, userId);
            return ResponseEntity.ok(Map.of("message", "Announcement deactivated successfully"));

        } catch (Exception e) {
            log.error("Error deactivating announcement {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate announcement", description = "Activate announcement (owner only)")
    public ResponseEntity<?> activateAnnouncement(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            announcementService.activateAnnouncement(id, userId);
            return ResponseEntity.ok(Map.of("message", "Announcement activated successfully"));

        } catch (Exception e) {
            log.error("Error activating announcement {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent announcements", description = "Get most recent announcements")
    public ResponseEntity<?> getRecentAnnouncements(
            @Parameter(description = "Number of announcements to return") @RequestParam(defaultValue = "10") int limit) {

        try {
            List<AnnouncementDto> announcements = announcementService.getRecentAnnouncements(limit);
            return ResponseEntity.ok(announcements);

        } catch (Exception e) {
            log.error("Error getting recent announcements: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get announcement statistics", description = "Get announcement counts and statistics")
    public ResponseEntity<?> getAnnouncementStats() {
        try {
            Map<String, Object> stats = Map.of(
                    "total", announcementService.getTotalAnnouncementsCount(),
                    "lost", announcementService.getAnnouncementsCountByType(AnnouncementType.LOST),
                    "found", announcementService.getAnnouncementsCountByType(AnnouncementType.FOUND),
                    "active", announcementService.getAnnouncementsCountByStatus(AnnouncementStatus.ACTIVE),
                    "resolved", announcementService.getAnnouncementsCountByStatus(AnnouncementStatus.RESOLVED));

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Error getting announcement stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}