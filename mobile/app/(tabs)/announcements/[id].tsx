import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { globalStyles, colors } from "../../../styles";
import {
  announcementService,
  getCategoryIcon,
  getTimeAgo,
} from "../../../services/announcement";
import { AnnouncementDto } from "../../../types/announcement";
import Toast from "react-native-toast-message";
import { messagingService } from "../../../services/messaging";

const { width: screenWidth } = Dimensions.get("window");

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if this is a deleted user's resolved announcement
  const isDeletedUserResolved =
    announcement?.username === "system-deleted-user";

  // Fetch announcement details
  const fetchAnnouncementDetails = async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await announcementService.getAnnouncementById(parseInt(id));
      console.log("Fetched announcement details:", data);
      setAnnouncement(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching announcement details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementDetails();
  }, [id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle contact owner
  const handleContactOwner = async () => {
    if (!announcement) return;

    try {
      console.log("Starting conversation with owner:", announcement.username);

      const conversation = await messagingService.startConversation({
        announcementId: announcement.id,
        initialMessage: `Hi! I'm interested in your ${announcement.type.toLowerCase()} item: "${announcement.title}". Can we discuss the details?`,
      });

      console.log("Conversation created:", conversation.id);

      router.push(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error("Failed to start conversation:", error);

      Toast.show({
        type: "error",
        text1: "Failed to Start Conversation",
        text2: error.message || "Please try again",
      });
    }
  };

  // Handle call owner
  const handleCallOwner = () => {
    if (!announcement?.contactInfo) return;
    console.log("Call owner:", announcement.contactInfo);
    // TODO: Implement phone call functionality
  };

  // Handle share
  const handleShare = () => {
    if (!announcement) return;
    console.log("Share announcement:", announcement.id);
    // TODO: Implement share functionality
  };

  // Render image gallery
  const renderImageGallery = () => {
    if (!announcement?.files || announcement.files.length === 0) {
      return (
        <View style={detailStyles.placeholderContainer}>
          <Ionicons
            name={getCategoryIcon(announcement?.category || "")}
            size={64}
            color={colors.warmTaupe}
          />
          <Text style={detailStyles.placeholderText}>No image available</Text>
        </View>
      );
    }

    return (
      <View style={detailStyles.imageContainer}>
        <Image
          source={{
            uri:
              announcement.files[currentImageIndex]?.url ||
              announcement.files[currentImageIndex]?.thumbnailUrl,
          }}
          style={detailStyles.mainImage}
          resizeMode="cover"
        />

        {announcement.files.length > 1 && (
          <View style={detailStyles.imageIndicators}>
            {announcement.files.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  detailStyles.indicator,
                  index === currentImageIndex && detailStyles.activeIndicator,
                ]}
                onPress={() => setCurrentImageIndex(index)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={globalStyles.announcementsLoadingContainer}>
          <ActivityIndicator size="large" color={colors.richOxblood} />
          <Text style={globalStyles.announcementsLoadingText}>
            Loading details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !announcement) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />

        {/* Header */}
        <View style={globalStyles.announcementsHeader}>
          <TouchableOpacity
            style={globalStyles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.deepBurgundy}
            />
          </TouchableOpacity>
          <Text style={globalStyles.announcementsHeaderTitle}>
            Item Details
          </Text>
          <View style={globalStyles.headerButton} />
        </View>

        <View style={globalStyles.announcementsErrorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={globalStyles.announcementsErrorText}>
            {error || "Item not found"}
          </Text>
          <TouchableOpacity
            style={globalStyles.announcementsRetryButton}
            onPress={fetchAnnouncementDetails}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.announcementsRetryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={globalStyles.announcementsHeader}>
        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <Text style={globalStyles.announcementsHeaderTitle}>
          {announcement.type === "LOST" ? "Lost Item" : "Found Item"}
        </Text>

        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={colors.deepBurgundy}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Content */}
        <View style={detailStyles.contentContainer}>
          {/* Title and Basic Info */}
          <View style={detailStyles.titleSection}>
            <Text style={detailStyles.title}>{announcement.title}</Text>

            <View style={detailStyles.metaRow}>
              <View
                style={[
                  detailStyles.typeBadge,
                  isDeletedUserResolved && detailStyles.resolvedBadge,
                ]}
              >
                <Text style={detailStyles.typeBadgeText}>
                  {isDeletedUserResolved ? "FOUND" : announcement.type}
                </Text>
              </View>
              <Text style={detailStyles.timeText}>
                {getTimeAgo(announcement.createdAt)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Description</Text>
            <Text style={detailStyles.description}>
              {announcement.description}
            </Text>
          </View>

          {/* Location */}
          {announcement.address && (
            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionTitle}>Location</Text>
              <View style={detailStyles.locationRow}>
                <Ionicons
                  name="location"
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={detailStyles.locationText}>
                  {announcement.address}
                </Text>
              </View>
            </View>
          )}

          {/* Additional Information */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>
              Additional Information
            </Text>

            <View style={detailStyles.infoGrid}>
              <View style={detailStyles.infoItem}>
                <Text style={detailStyles.infoLabel}>CATEGORY</Text>
                <Text style={detailStyles.infoValue}>
                  {announcement.category.charAt(0) +
                    announcement.category.slice(1).toLowerCase()}
                </Text>
              </View>

              <View style={detailStyles.infoItem}>
                <Text style={detailStyles.infoLabel}>STATUS</Text>
                <Text style={detailStyles.infoValue}>
                  {announcement.status.charAt(0) +
                    announcement.status.slice(1).toLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Posted By */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Posted by</Text>
            {isDeletedUserResolved ? (
              <View style={detailStyles.deletedUserInfo}>
                <View style={detailStyles.userAvatar}>
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={colors.text.secondary}
                  />
                </View>
                <View style={detailStyles.userDetails}>
                  <Text style={detailStyles.deletedUserName}>Deleted User</Text>
                  <Text style={detailStyles.userMeta}>
                    Item was found • Original poster account deleted
                  </Text>
                </View>
              </View>
            ) : (
              <View style={detailStyles.userInfo}>
                <View style={detailStyles.userAvatar}>
                  <Ionicons name="person" size={24} color={colors.warmTaupe} />
                </View>
                <View style={detailStyles.userDetails}>
                  <Text style={detailStyles.userName}>
                    {announcement.userFullName || announcement.username}
                  </Text>
                  <Text style={detailStyles.userMeta}>
                    Posted {getTimeAgo(announcement.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={detailStyles.actionContainer}>
        {isDeletedUserResolved ? (
          <View style={detailStyles.noContactContainer}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={detailStyles.noContactText}>
              This item was found, but contact is no longer available
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={detailStyles.contactButton}
              onPress={handleContactOwner}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble" size={22} color={colors.white} />
              <Text style={detailStyles.contactButtonText}>Send Message</Text>
            </TouchableOpacity>

            {announcement.contactInfo && (
              <TouchableOpacity
                style={detailStyles.callButton}
                onPress={handleCallOwner}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={20} color={colors.deepBurgundy} />
                <Text style={detailStyles.callButtonText}>Call Owner</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const detailStyles = {
  // Image gallery
  imageContainer: {
    height: 300,
    backgroundColor: colors.border.light,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  mainImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
  placeholderContainer: {
    height: 300,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: colors.softRose,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.warmTaupe,
    marginTop: 12,
  },
  imageIndicators: {
    position: "absolute" as const,
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },

  // Content
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Title section
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  typeBadge: {
    backgroundColor: colors.richOxblood,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedBadge: {
    backgroundColor: "#10B981", // Green for resolved items
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
    textTransform: "uppercase" as const,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
    lineHeight: 24,
  },

  // Location
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },

  // Info grid
  infoGrid: {
    flexDirection: "row" as const,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.secondary,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
    fontWeight: "500" as const,
  },

  // User info
  userInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  deletedUserInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    opacity: 0.7,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softRose,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 4,
  },
  deletedUserName: {
    fontSize: 16,
    fontWeight: "500" as const,
    fontFamily: "DMSans",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
  },

  // Action buttons
  actionContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: colors.richOxblood,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.richOxblood,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.deepBurgundy,
  },
  noContactContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 16,
    backgroundColor: colors.info + "10",
    borderRadius: 8,
    gap: 8,
  },
  noContactText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.info,
    textAlign: "center" as const,
  },
};
