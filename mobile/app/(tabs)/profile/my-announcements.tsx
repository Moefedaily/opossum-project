import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { userService } from "../../../services/user";
import { globalStyles, colors } from "../../../styles";
import { FileDto } from "../../../types/announcement";
import { UserAnnouncementResponse } from "../../../types/profile";

type FilterStatus = "ALL" | "ACTIVE" | "RESOLVED" | "EXPIRED";

export default function MyAnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<
    UserAnnouncementResponse[]
  >([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    UserAnnouncementResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    loadMyAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, activeFilter]);

  const loadMyAnnouncements = async () => {
    try {
      setIsLoading(true);
      const userAnnouncements = await userService.getUserAnnouncements();
      setAnnouncements(userAnnouncements);
    } catch (error: any) {
      console.error("Failed to load announcements:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Announcements",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadMyAnnouncements();
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterAnnouncements = () => {
    if (activeFilter === "ALL") {
      setFilteredAnnouncements(announcements);
    } else {
      setFilteredAnnouncements(
        announcements.filter(
          (announcement) => announcement.status === activeFilter
        )
      );
    }
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
  };

  const handleAnnouncementPress = (announcementId: number) => {
    // Navigate to announcement detail screen
    router.push(`/(tabs)/announcements/${announcementId}`);
  };

  const handleEditAnnouncement = (announcementId: number) => {
    // TODO: Navigate to edit announcement screen
    // This will be implemented when we add edit functionality
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Edit functionality will be available soon!",
    });
  };

  const handleDeleteAnnouncement = (announcement: UserAnnouncementResponse) => {
    Alert.alert(
      "Delete Announcement",
      `Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteAnnouncement(announcement.id),
        },
      ]
    );
  };

  const confirmDeleteAnnouncement = async (announcementId: number) => {
    try {
      // TODO: Implement delete announcement API call
      // await announcementService.deleteAnnouncement(announcementId);

      // For now, just show success and remove from local state
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));

      Toast.show({
        type: "success",
        text1: "Announcement Deleted",
        text2: "Your announcement has been successfully deleted",
      });
    } catch (error: any) {
      console.error("Failed to delete announcement:", error);
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: error.message || "Please try again",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return colors.success;
      case "RESOLVED":
        return colors.info;
      case "EXPIRED":
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "checkmark-circle";
      case "RESOLVED":
        return "checkmark-done-circle";
      case "EXPIRED":
        return "time-outline";
      default:
        return "help-circle";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "LOST" ? colors.danger : colors.info;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderFilterButton = (
    filter: FilterStatus,
    label: string,
    count: number
  ) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => handleFilterChange(filter)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
        <View
          style={[styles.filterCount, isActive && styles.filterCountActive]}
        >
          <Text
            style={[
              styles.filterCountText,
              isActive && styles.filterCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAnnouncementCard = (announcement: UserAnnouncementResponse) => {
    return (
      <TouchableOpacity
        key={announcement.id}
        style={styles.announcementCard}
        onPress={() => handleAnnouncementPress(announcement.id)}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: getTypeColor(announcement.type) },
              ]}
            >
              <Text style={styles.typeTagText}>{announcement.type}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(announcement.status) as any}
                size={16}
                color={getStatusColor(announcement.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(announcement.status) },
                ]}
              >
                {announcement.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                "Announcement Options",
                `Options for "${announcement.title}"`,
                [
                  {
                    text: "Edit",
                    onPress: () => handleEditAnnouncement(announcement.id),
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteAnnouncement(announcement),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ]
              );
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.announcementTitle} numberOfLines={2}>
            {announcement.title}
          </Text>

          {/* Description */}
          <Text style={styles.announcementDescription} numberOfLines={3}>
            {announcement.description}
          </Text>

          {/* Images */}
          {announcement.files && announcement.files.length > 0 && (
            <View style={styles.imagesContainer}>
              {announcement.files
                .slice(0, 3)
                .map((file: FileDto, index: number) => (
                  <View key={file.id} style={styles.imageContainer}>
                    {/* TODO: Replace with actual image loading when file system is set up */}
                    {file.thumbnailUrl || file.url ? (
                      <Image
                        source={{ uri: file.thumbnailUrl || file.url }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="image"
                          size={20}
                          color={colors.text.secondary}
                        />
                      </View>
                    )}
                    {announcement.files!.length > 3 && index === 2 && (
                      <View style={styles.imageOverlay}>
                        <Text style={styles.imageOverlayText}>
                          +{announcement.files!.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
            </View>
          )}
          {/* Location */}
          {announcement.address && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {announcement.address}
              </Text>
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.dateText}>
              Created {formatDate(announcement.createdAt)}
            </Text>
          </View>

          <View style={styles.cardFooterRight}>
            <Ionicons
              name="eye-outline"
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.viewText}>View Details</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getFilterCounts = () => {
    return {
      all: announcements.length,
      active: announcements.filter((a) => a.status === "ACTIVE").length,
      resolved: announcements.filter((a) => a.status === "RESOLVED").length,
      expired: announcements.filter((a) => a.status === "EXPIRED").length,
    };
  };

  const filterCounts = getFilterCounts();

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.richOxblood} />
        <Text
          style={[
            globalStyles.bodyText,
            { marginTop: 16, textAlign: "center" },
          ]}
        >
          Loading your announcements...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <Text style={[globalStyles.heading2, styles.headerTitle]}>
          My Announcements
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/create")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={colors.richOxblood} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {renderFilterButton("ALL", "All", filterCounts.all)}
          {renderFilterButton("ACTIVE", "Active", filterCounts.active)}
          {renderFilterButton("RESOLVED", "Resolved", filterCounts.resolved)}
          {renderFilterButton("EXPIRED", "Expired", filterCounts.expired)}
        </ScrollView>
      </View>

      {/* Content */}
      {announcements.length === 0 ? (
        // Empty State
        <View style={styles.emptyContainer}>
          <Ionicons
            name="megaphone-outline"
            size={80}
            color={colors.text.secondary}
          />
          <Text style={[globalStyles.heading2, styles.emptyTitle]}>
            No Announcements Yet
          </Text>
          <Text style={[globalStyles.bodyText, styles.emptySubtitle]}>
            Create your first announcement to help find lost items or report
            found ones.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/create")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.createButtonText}>Create Announcement</Text>
          </TouchableOpacity>
        </View>
      ) : filteredAnnouncements.length === 0 ? (
        // No Results for Filter
        <View style={styles.emptyContainer}>
          <Ionicons
            name="filter-outline"
            size={80}
            color={colors.text.secondary}
          />
          <Text style={[globalStyles.heading2, styles.emptyTitle]}>
            No {activeFilter.toLowerCase()} announcements
          </Text>
          <Text style={[globalStyles.bodyText, styles.emptySubtitle]}>
            Try selecting a different filter to see your announcements.
          </Text>
        </View>
      ) : (
        // Announcements List
        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.richOxblood]}
              tintColor={colors.richOxblood}
            />
          }
        >
          <View style={styles.listContent}>
            {filteredAnnouncements.map(renderAnnouncementCard)}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center" as const,
    color: colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  filterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.softRose,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: colors.richOxblood,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text.secondary,
    marginRight: 8,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterCount: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center" as const,
  },
  filterCountActive: {
    backgroundColor: colors.softRose,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },
  filterCountTextActive: {
    color: colors.richOxblood,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    textAlign: "center" as const,
    marginTop: 24,
    marginBottom: 12,
    color: colors.text.primary,
  },
  emptySubtitle: {
    textAlign: "center" as const,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  announcementCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  typeTag: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  typeTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginLeft: 4,
    textTransform: "capitalize" as const,
  },
  moreButton: {
    padding: 4,
  },
  cardContent: {
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  announcementDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row" as const,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative" as const,
    marginRight: 8,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.warmTaupe,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  imageOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  locationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  locationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 12,
  },
  cardFooterLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  cardFooterRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  viewText: {
    fontSize: 12,
    color: colors.richOxblood,
    marginLeft: 4,
    fontWeight: "500" as const,
  },
  bottomSpacing: {
    height: 32,
  },
});
