package com.opossum.repository;

import com.opossum.entity.messaging.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

        // Find messages in conversation
        List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

        // Find recent messages in conversation
        List<Message> findTop50ByConversationIdOrderByCreatedAtDesc(Long conversationId);

        // Count unread messages for user in conversation
        @Query("SELECT COUNT(m) FROM Message m WHERE " +
                        "m.conversation.id = :conversationId AND " +
                        "m.sender.id != :userId AND " +
                        "m.isRead = false")
        long countUnreadByConversationAndUser(@Param("conversationId") Long conversationId,
                        @Param("userId") Long userId);

        // Count unread messages for user across all conversations
        @Query("SELECT COUNT(m) FROM Message m WHERE " +
                        "(m.conversation.starterUser.id = :userId OR m.conversation.recipientUser.id = :userId) AND " +
                        "m.sender.id != :userId AND " +
                        "m.isRead = false")
        long countUnreadByUser(@Param("userId") Long userId);

        // Find messages by sender
        List<Message> findBySenderId(Long senderId);

        // Find messages by date range
        List<Message> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

        // Get last message in conversation
        @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
                        "ORDER BY m.createdAt DESC LIMIT 1")
        Message findLastMessageByConversationId(@Param("conversationId") Long conversationId);

        void deleteByConversationId(Long conversationId);
}