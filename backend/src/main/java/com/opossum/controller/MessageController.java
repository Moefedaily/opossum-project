package com.opossum.controller;

import com.opossum.dto.messaging.CreateMessageRequest;
import com.opossum.dto.messaging.MessageDto;
import com.opossum.service.MessageService;
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
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Messages", description = "Message management and communication")
public class MessageController {

    private final MessageService messageService;
    private final JwtService jwtService;

    @PostMapping
    @Operation(summary = "Send message", description = "Send a message in a conversation")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Message sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<?> sendMessage(
            @Valid @RequestBody CreateMessageRequest request,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7); // Remove "Bearer "
            Long userId = jwtService.extractUserId(token);

            MessageDto message = messageService.sendMessage(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);

        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversation/{conversationId}")
    @Operation(summary = "Get conversation messages", description = "Get all messages in a conversation")
    public ResponseEntity<?> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            List<MessageDto> messages = messageService.getConversationMessages(conversationId, userId);
            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            log.error("Error getting conversation messages: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get message by ID", description = "Get specific message details")
    public ResponseEntity<?> getMessageById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            Optional<MessageDto> message = messageService.getMessageById(id, userId);

            if (message.isPresent()) {
                return ResponseEntity.ok(message.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting message by ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark message as read", description = "Mark a specific message as read")
    public ResponseEntity<?> markMessageAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            MessageDto message = messageService.markMessageAsRead(id, userId);
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("Error marking message as read {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/conversation/{conversationId}/read-all")
    @Operation(summary = "Mark all messages as read", description = "Mark all messages in a conversation as read")
    public ResponseEntity<?> markConversationMessagesAsRead(
            @PathVariable Long conversationId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            messageService.markConversationMessagesAsRead(conversationId, userId);
            return ResponseEntity.ok(Map.of("message", "All messages marked as read"));

        } catch (Exception e) {
            log.error("Error marking conversation messages as read {}: {}", conversationId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete message", description = "Delete a message (sender only)")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            messageService.deleteMessage(id, userId);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));

        } catch (Exception e) {
            log.error("Error deleting message {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread messages count", description = "Get total count of unread messages for user")
    public ResponseEntity<?> getUnreadMessageCount(
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            long count = messageService.getUnreadMessageCount(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));

        } catch (Exception e) {
            log.error("Error getting unread message count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversation/{conversationId}/unread-count")
    @Operation(summary = "Get conversation unread count", description = "Get count of unread messages in specific conversation")
    public ResponseEntity<?> getConversationUnreadCount(
            @PathVariable Long conversationId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Extract user ID from JWT token
            String token = authHeader.substring(7);
            Long userId = jwtService.extractUserId(token);

            long count = messageService.getUnreadMessageCountForConversation(conversationId, userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));

        } catch (Exception e) {
            log.error("Error getting conversation unread count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}