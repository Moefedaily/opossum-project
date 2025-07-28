package com.opossum.controller;

import com.opossum.dto.messaging.ConversationDto;
import com.opossum.dto.messaging.StartConversationRequest;
import com.opossum.service.ConversationService;
import com.opossum.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Conversations", description = "User conversation management")
public class ConversationController {

    private final ConversationService conversationService;
    private final JwtService jwtService;

    @PostMapping("/start")
    @Operation(summary = "Start conversation", description = "Start a new conversation about an announcement")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conversation started successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<?> startConversation(
            @Valid @RequestBody StartConversationRequest request,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7); // Remove "Bearer "
            Long userId = jwtService.extractUserId(token);

            ConversationDto conversation = conversationService.startConversation(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(conversation);

        } catch (Exception e) {
            log.error("Error starting conversation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get user conversations", description = "Get all conversations for the current user")
    public ResponseEntity<?> getUserConversations(
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<ConversationDto> conversations = conversationService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);

        } catch (Exception e) {
            log.error("Error getting user conversations: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active")
    @Operation(summary = "Get active conversations", description = "Get only active conversations for the current user")
    public ResponseEntity<?> getActiveConversations(
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<ConversationDto> conversations = conversationService.getActiveConversations(userId);
            return ResponseEntity.ok(conversations);

        } catch (Exception e) {
            log.error("Error getting active conversations: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get conversation by ID", description = "Get specific conversation details")
    public ResponseEntity<?> getConversationById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            Optional<ConversationDto> conversation = conversationService.getConversationById(id, userId);

            if (conversation.isPresent()) {
                return ResponseEntity.ok(conversation.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting conversation by ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive conversation", description = "Archive a conversation")
    public ResponseEntity<?> archiveConversation(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            conversationService.archiveConversation(id, userId);
            return ResponseEntity.ok(Map.of("message", "Conversation archived successfully"));

        } catch (Exception e) {
            log.error("Error archiving conversation {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reactivate")
    @Operation(summary = "Reactivate conversation", description = "Reactivate an archived conversation")
    public ResponseEntity<?> reactivateConversation(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            conversationService.reactivateConversation(id, userId);
            return ResponseEntity.ok(Map.of("message", "Conversation reactivated successfully"));

        } catch (Exception e) {
            log.error("Error reactivating conversation {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread conversations count", description = "Get count of conversations with unread messages")
    public ResponseEntity<?> getUnreadConversationsCount(
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            long count = conversationService.getUnreadConversationsCount(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));

        } catch (Exception e) {
            log.error("Error getting unread conversations count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // Add to existing ConversationController.java

    @GetMapping("/admin/all")
    @Operation(summary = "Get all conversations (Admin)", description = "Admin view of all conversations in system")
    public ResponseEntity<?> getAllConversationsAdmin() {
        try {
            List<ConversationDto> conversations = conversationService.getAllConversationsForAdmin();
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            log.error("Error getting all conversations for admin: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/stats")
    @Operation(summary = "Get conversation statistics (Admin)")
    public ResponseEntity<?> getConversationStatsAdmin() {
        try {
            Map<String, Object> stats = conversationService.getConversationStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting conversation stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Delete conversation (Admin)", description = "Admin delete any conversation")
    public ResponseEntity<?> deleteConversationAdmin(@PathVariable Long id) {
        try {
            conversationService.deleteConversationAsAdmin(id);
            return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting conversation {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Change conversation status (Admin)", description = "Admin change conversation status")
    public ResponseEntity<?> changeConversationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            ConversationDto conversation = conversationService.changeConversationStatus(id, newStatus);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            log.error("Error changing conversation status {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}