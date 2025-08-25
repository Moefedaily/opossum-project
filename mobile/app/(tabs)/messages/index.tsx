// app/(tabs)/messages/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { messagingService } from "../../../services/messaging";
import { ConversationDto } from "../../../types/messaging";
import { colors, fonts } from "../../../styles";

// Helper function for time formatting
const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversationList = await messagingService.getUserConversations();
      setConversations(conversationList);
      console.log("📬 Loaded conversations:", conversationList.length);
    } catch (error: any) {
      console.error("❌ Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadConversations();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConversationPress = (conversationId: number) => {
    router.push(`/messages/${conversationId}`);
  };

  const handleBrowseItems = () => {
    router.push("/(tabs)/announcements");
  };

  const renderConversationItem = ({ item }: { item: ConversationDto }) => {
    // Use otherUser from backend - the person you're chatting with
    const otherUserName =
      item.otherUser?.firstName || item.otherUser?.username || "User";
    const hasUnread = item.unreadMessageCount && item.unreadMessageCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id)}
        activeOpacity={0.7}
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.warmTaupe} />
          </View>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadMessageCount! > 99
                  ? "99+"
                  : item.unreadMessageCount}
              </Text>
            </View>
          )}
        </View>

        {/* Conversation Details */}
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUserName}
            </Text>
            <Text style={styles.timestamp}>
              {item.lastMessageAt
                ? formatConversationTime(item.lastMessageAt)
                : ""}
            </Text>
          </View>

          <View style={styles.announcementTitleContainer}>
            <Ionicons
              name={
                item.announcement?.type === "LOST"
                  ? "search"
                  : "checkmark-circle"
              }
              size={16}
              color={
                item.announcement?.type === "LOST"
                  ? colors.danger
                  : colors.success
              }
            />
            <Text style={styles.announcementTitle} numberOfLines={1}>
              {item.announcement?.title || "Item Discussion"}
            </Text>
          </View>

          <Text
            style={[styles.lastMessage, hasUnread ? styles.unreadMessage : {}]}
            numberOfLines={2}
          >
            {item.lastMessage?.messageText || "Start the conversation..."}
          </Text>
        </View>
        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color={colors.warmTaupe} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="chatbubbles-outline"
          size={64}
          color={colors.warmTaupe}
        />
      </View>
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptyDescription}>
        Start conversations by messaging item owners when you find something
        interesting!
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={handleBrowseItems}>
        <Text style={styles.browseButtonText}>Browse Items</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cardPrimary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.cardPrimary]}
            tintColor={colors.cardPrimary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          conversations.length === 0
            ? styles.emptyListContainer
            : styles.listContainer
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
  },

  // Header
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.deepBurgundy,
    fontFamily: fonts.primary,
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cardSecondary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: fonts.primary,
  },

  // Conversation Details
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.deepBurgundy,
    fontFamily: fonts.primary,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
  },
  announcementTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: "600",
    color: colors.text.primary,
  },
  announcementTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.deepBurgundy,
    fontFamily: fonts.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: colors.cardPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary,
  },
});
