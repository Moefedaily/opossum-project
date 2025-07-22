import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { globalStyles, colors } from "../../styles";
import {
  announcementService,
  getCategoryIcon,
  getTimeAgo,
} from "../../services/announcement";
import { AnnouncementDto } from "../../types/announcement";

type CategoryTab = "ALL" | "ELECTRONICS" | "CLOTHING" | "DOCUMENTS";

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("ALL");
  const [error, setError] = useState<string | null>(null);

  // Category tabs configuration
  const categoryTabs: { key: CategoryTab; label: string; param?: string }[] = [
    { key: "ALL", label: "All" },
    { key: "ELECTRONICS", label: "Mobile", param: "ELECTRONICS" },
    { key: "CLOTHING", label: "Clothing", param: "CLOTHING" },
    { key: "DOCUMENTS", label: "Documents", param: "DOCUMENTS" },
  ];

  // Fetch announcements using the service
  const fetchAnnouncements = async (category?: string) => {
    try {
      setError(null);
      const params = category && category !== "ALL" ? { category } : undefined;
      const data = await announcementService.getAllAnnouncements(params);
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const categoryParam =
      selectedCategory === "ALL" ? undefined : selectedCategory;
    fetchAnnouncements(categoryParam);
  }, [selectedCategory]);

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    const categoryParam =
      selectedCategory === "ALL" ? undefined : selectedCategory;
    fetchAnnouncements(categoryParam);
  };

  // Handle category tab change
  const handleCategoryChange = (category: CategoryTab) => {
    setSelectedCategory(category);
    setLoading(true);
  };

  // Handle item press - Navigate to detail screen
  const handleItemPress = (announcement: AnnouncementDto) => {
    console.log("Navigate to item detail:", announcement.id);
    router.push(`/announcements/${announcement.id}`);
  };

  // Handle share
  const handleShare = (announcement: AnnouncementDto) => {
    console.log("Share announcement:", announcement.id);
    // TODO: Implement share functionality
  };

  // Handle favorite
  const handleFavorite = (announcement: AnnouncementDto) => {
    console.log("Toggle favorite:", announcement.id);
    // TODO: Implement favorite functionality
  };

  // Render announcement card using global styles
  const renderAnnouncementCard = ({ item }: { item: AnnouncementDto }) => (
    <TouchableOpacity
      style={globalStyles.announcementCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      {/* Image or placeholder */}
      <View style={globalStyles.announcementImageContainer}>
        {item.files && item.files.length > 0 ? (
          <Image
            source={{ uri: item.files[0].thumbnailUrl || item.files[0].url }}
            style={globalStyles.announcementImage}
            resizeMode="cover"
          />
        ) : (
          <View style={globalStyles.announcementImagePlaceholder}>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={32}
              color={colors.warmTaupe}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={globalStyles.announcementCardContent}>
        <Text style={globalStyles.announcementCardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={globalStyles.announcementCardMeta}>
          <View style={globalStyles.announcementLocationRow}>
            <Ionicons name="location" size={12} color={colors.text.secondary} />
            <Text
              style={globalStyles.announcementLocationText}
              numberOfLines={1}
            >
              {item.address || "Location not specified"}
            </Text>
          </View>

          <Text style={globalStyles.announcementTimeText}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={globalStyles.announcementCardActions}>
          <TouchableOpacity
            style={globalStyles.announcementShareButton}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.announcementShareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={globalStyles.announcementFavoriteButton}
            onPress={() => handleFavorite(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

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

        <Text style={globalStyles.announcementsHeaderTitle}>Items</Text>

        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={() => console.log("Search")}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={globalStyles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={globalStyles.categoryScrollContent}
        >
          {categoryTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                globalStyles.categoryTab,
                selectedCategory === tab.key && globalStyles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  globalStyles.categoryTabText,
                  selectedCategory === tab.key &&
                    globalStyles.categoryTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={globalStyles.announcementsLoadingContainer}>
          <ActivityIndicator size="large" color={colors.richOxblood} />
          <Text style={globalStyles.announcementsLoadingText}>
            Loading items...
          </Text>
        </View>
      ) : error ? (
        <View style={globalStyles.announcementsErrorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={globalStyles.announcementsErrorText}>{error}</Text>
          <TouchableOpacity
            style={globalStyles.announcementsRetryButton}
            onPress={() => {
              setLoading(true);
              const categoryParam =
                selectedCategory === "ALL" ? undefined : selectedCategory;
              fetchAnnouncements(categoryParam);
            }}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.announcementsRetryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={globalStyles.announcementsList}
          columnWrapperStyle={globalStyles.announcementsRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.richOxblood]}
              tintColor={colors.richOxblood}
            />
          }
          ListEmptyComponent={
            <View style={globalStyles.announcementsEmptyContainer}>
              <Ionicons name="search" size={64} color={colors.warmTaupe} />
              <Text style={globalStyles.announcementsEmptyTitle}>
                No items found
              </Text>
              <Text style={globalStyles.announcementsEmptySubtitle}>
                Try changing the category or check back later
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ✅ CLEAN IMPLEMENTATION:
// - Uses focused announcementService (only 3 functions)
// - Imports types from types/announcement.ts
// - Uses global styles consistently
// - Handles Cloudinary images + category placeholders
// - Public mobile functionality only
