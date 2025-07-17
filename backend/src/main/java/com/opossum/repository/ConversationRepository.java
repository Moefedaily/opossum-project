package com.opossum.repository;

import com.opossum.entity.messaging.Conversation;
import com.opossum.entity.messaging.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Find conversations for a user
    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.starterUser.id = :userId OR c.recipientUser.id = :userId) " +
            "AND c.status = :status " +
            "ORDER BY c.lastMessageAt DESC, c.createdAt DESC")
    List<Conversation> findByUserIdAndStatus(@Param("userId") Long userId,
            @Param("status") ConversationStatus status);

    // Find all conversations for a user
    @Query("SELECT c FROM Conversation c WHERE " +
            "c.starterUser.id = :userId OR c.recipientUser.id = :userId " +
            "ORDER BY c.lastMessageAt DESC, c.createdAt DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    // Find existing conversation between two users about specific announcement
    @Query("SELECT c FROM Conversation c WHERE " +
            "c.announcement.id = :announcementId AND " +
            "((c.starterUser.id = :userId1 AND c.recipientUser.id = :userId2) OR " +
            " (c.starterUser.id = :userId2 AND c.recipientUser.id = :userId1))")
    Optional<Conversation> findByAnnouncementAndUsers(@Param("announcementId") Long announcementId,
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2);

    // Find conversations by announcement
    List<Conversation> findByAnnouncementId(Long announcementId);

    // Count conversations for user
    @Query("SELECT COUNT(c) FROM Conversation c WHERE " +
            "(c.starterUser.id = :userId OR c.recipientUser.id = :userId) " +
            "AND c.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ConversationStatus status);
}