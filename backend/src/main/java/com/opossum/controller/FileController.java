package com.opossum.controller;

import com.opossum.dto.file.FileDto;
import com.opossum.dto.file.FileUploadResponse;
import com.opossum.service.AnnouncementService;
import com.opossum.service.FileService;
import com.opossum.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Files", description = "File management for announcements")
public class FileController {

    private final FileService fileService;
    private final AnnouncementService announcementService;
    private final JwtService jwtService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a single file", description = "Upload a file and associate it with an announcement")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "File uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or file"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<?> uploadFile(
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "ID of the announcement to associate the file with") @RequestParam("announcementId") Long announcementId,
            HttpServletRequest request) {

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authorization header missing"));
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // Extract user ID using your existing JwtService
            Long userId = jwtService.extractUserId(token);

            FileUploadResponse response = fileService.uploadFile(file, announcementId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            log.warn("Unauthorized file upload attempt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading file for announcement {}: {}", announcementId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed. Please try again."));
        }
    }

    @PostMapping("/upload-multiple")
    @Operation(summary = "Upload multiple files", description = "Upload multiple files and associate them with an announcement")
    public ResponseEntity<?> uploadMultipleFiles(
            @Parameter(description = "Files to upload") @RequestParam("files") List<MultipartFile> files,
            @Parameter(description = "ID of the announcement to associate files with") @RequestParam("announcementId") Long announcementId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<FileUploadResponse> responses = fileService.uploadFiles(files, announcementId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(responses);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            log.warn("Unauthorized file upload attempt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading file for announcement {}: {}", announcementId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed. Please try again."));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get photo details", description = "Get photo metadata by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Photo details retrieved"),
            @ApiResponse(responseCode = "404", description = "Photo not found")
    })
    public ResponseEntity<?> getFileById(@PathVariable Long id) {
        try {
            return fileService.getFileById(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting file by ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve photo"));
        }
    }

    @GetMapping("/announcement/{announcementId}")
    @Operation(summary = "Get announcement photos", description = "Get all photos for a specific announcement")
    public ResponseEntity<?> getFilesByAnnouncement(
            @PathVariable Long announcementId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<FileDto> files = fileService.getFilesByAnnouncementId(announcementId);

            // If auth header is provided, add ownership info for editing capabilities
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    Long userId = jwtService.extractUserId(token);

                    // Check if user owns this announcement (for edit capabilities)
                    boolean canEdit = announcementService.isAnnouncementOwner(announcementId, userId);

                    // Add metadata about edit permissions
                    Map<String, Object> response = Map.of(
                            "files", files,
                            "canEdit", canEdit,
                            "announcementId", announcementId);
                    return ResponseEntity.ok(response);

                } catch (Exception e) {
                    // If token is invalid, just return files without edit capabilities
                    log.debug("Invalid token provided, returning read-only view");
                }
            }

            // Default: just return files (read-only)
            return ResponseEntity.ok(files);

        } catch (Exception e) {
            log.error("Error getting files for announcement {}: {}", announcementId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve photos"));
        }
    }

    @GetMapping("/my")
    @Operation(summary = "Get my photos", description = "Get all photos uploaded by current user")
    public ResponseEntity<?> getMyFiles(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<FileDto> files = fileService.getFilesByUserId(userId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            log.error("Error getting user files: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve your photos"));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete photo", description = "Delete a photo (owner only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Photo deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Not authorized to delete this photo"),
            @ApiResponse(responseCode = "404", description = "Photo not found")
    })
    public ResponseEntity<?> deleteFile(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            fileService.deleteFile(id, userId);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));

        } catch (SecurityException e) {
            log.warn("Unauthorized file deletion attempt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting file {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete photo"));
        }
    }

    // Admin endpoints

    @GetMapping("/admin/all")
    @Operation(summary = "Get all photos (Admin)", description = "Get all photos in the system (Admin only)")
    public ResponseEntity<?> getAllFilesForAdmin(@RequestHeader("Authorization") String authHeader) {
        try {
            List<FileDto> files = fileService.getAllFilesForAdmin();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            log.error("Error getting all files for admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve photos"));
        }
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Delete any photo (Admin)", description = "Delete any photo regardless of ownership (Admin only)")
    public ResponseEntity<?> adminDeleteFile(@PathVariable Long id) {
        try {
            fileService.adminDeleteFile(id);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully by admin"));
        } catch (Exception e) {
            log.error("Error in admin file deletion {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete photo"));
        }
    }

    @GetMapping("/admin/stats")
    @Operation(summary = "Get photo statistics (Admin)", description = "Get basic photo statistics (Admin only)")
    public ResponseEntity<?> getFileStats() {
        try {
            long totalFiles = fileService.getTotalFileCount();
            Map<String, Object> stats = Map.of(
                    "totalFiles", totalFiles,
                    "message", "Basic file statistics");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting file statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve statistics"));
        }
    }
}