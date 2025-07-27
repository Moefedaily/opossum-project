import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { messagingService } from "../../../services/messaging";
import { MessageDto } from "../../../types/messaging";
import { colors, fonts } from "../../../styles";
import { userService } from "../../../services/user";

// Helper function for message time formatting
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Refs for polling and auto-scroll
  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };

    getCurrentUser();

    if (!conversationId) {
      router.back();
      return;
    }

    // Initial load
    loadMessages();

    // Start 3-second polling
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [conversationId]);

  const startPolling = () => {
    console.log("Starting message polling...");
    pollingIntervalRef.current = setInterval(() => {
      console.log("Polling for new messages...");
      loadMessages(false);
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log("Stopping message polling");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const messageList = await messagingService.getConversationMessages(
        parseInt(conversationId!)
      );

      // Update messages
      setMessages(messageList);

      // Set conversation details from first message if available
      if (messageList.length > 0) {
        const firstMessage = messageList[0];
        setOtherUserName(firstMessage.senderUsername || "User");
        setAnnouncementTitle("Discussion"); // Will be set from conversation details
      }

      // Auto-scroll to bottom if new messages arrived
      if (messageList.length > lastMessageCountRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      lastMessageCountRef.current = messageList.length;
    } catch (error: any) {
      if (showLoading) {
        Alert.alert("Error", "Failed to load messages. Please try again.");
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      await messagingService.sendMessage({
        conversationId: parseInt(conversationId!),
        content: messageContent,
      });

      // Immediately reload messages to show the new message
      await loadMessages(false);
    } catch (error: any) {
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Restore message content on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    stopPolling();
    router.back();
  };

  const renderMessage = ({ item }: { item: MessageDto }) => {
    // Compare senderId with current user ID to determine ownership
    const isOwnMessage = currentUserId
      ? item.senderId === currentUserId
      : false;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.messageText}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatMessageTime(item.createdAt)}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={item.isRead ? "checkmark-done" : "checkmark"}
                size={16}
                color={item.isRead ? colors.success : colors.warmTaupe}
                style={styles.readReceipt}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cardPrimary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName}
          </Text>
          {announcementTitle && (
            <View style={styles.headerSubtitleContainer}>
              <Ionicons name="people" size={14} color={colors.text.secondary} />
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {announcementTitle}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.deepBurgundy}
          />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Start the conversation about this item!
              </Text>
            </View>
          )}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message here..."
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.deepBurgundy,
    fontFamily: fonts.primary,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
    marginLeft: 4,
    flex: 1,
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Chat
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Messages
  messageContainer: {
    marginBottom: 16,
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownMessageBubble: {
    backgroundColor: colors.cardPrimary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.secondary,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  messageTime: {
    fontSize: 12,
    fontFamily: fonts.secondary,
  },
  ownMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: colors.text.secondary,
  },
  readReceipt: {
    marginLeft: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
    textAlign: "center",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text.primary,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.warmTaupe,
    opacity: 0.5,
  },
});
