import React, { useState, useEffect, useRef } from "react";
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
import SearchModal from "../../components/searchComponent";

type CategoryTab = "ALL" | "ELECTRONICS" | "CLOTHING" | "DOCUMENTS";

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [previousCategory, setPreviousCategory] = useState<CategoryTab>("ALL");

  const categoryTabs: { key: CategoryTab; label: string; param?: string }[] = [
    { key: "ALL", label: "All" },
    { key: "ELECTRONICS", label: "Mobile", param: "ELECTRONICS" },
    { key: "CLOTHING", label: "Clothing", param: "CLOTHING" },
    { key: "DOCUMENTS", label: "Documents", param: "DOCUMENTS" },
  ];

  const fetchAnnouncements = async (category?: string, search?: string) => {
    try {
      setError(null);

      const params: { category?: string; search?: string } = {};

      if (category && category !== "ALL") {
        params.category = category;
      }

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const data = await announcementService.getAllAnnouncements(
        Object.keys(params).length > 0 ? params : undefined
      );

      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const categoryParam =
      selectedCategory === "ALL" ? undefined : selectedCategory;
    fetchAnnouncements(categoryParam);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    const categoryParam =
      selectedCategory === "ALL" ? undefined : selectedCategory;

    if (isSearchMode) {
      fetchAnnouncements(undefined, searchQuery);
    } else {
      fetchAnnouncements(categoryParam);
    }
  };

  const handleCategoryChange = (category: CategoryTab) => {
    if (isSearchMode) {
      setSearchQuery("");
      setIsSearchMode(false);
    }

    setSelectedCategory(category);
    setLoading(true);

    const categoryParam = category === "ALL" ? undefined : category;
    fetchAnnouncements(categoryParam);
  };

  const handleItemPress = (announcement: AnnouncementDto) => {
    router.push(`/announcements/${announcement.id}`);
  };

  const handleSearch = (query: string) => {
    const normalizedQuery = query?.trim() || "";

    if (normalizedQuery.length > 0) {
      setPreviousCategory(selectedCategory);
      setSelectedCategory("ALL");
      setSearchQuery(normalizedQuery);
      setIsSearchMode(true);
      setLoading(true);

      fetchAnnouncements(undefined, normalizedQuery);
    } else {
      setSearchQuery("");
      setIsSearchMode(false);
      setLoading(true);
      setSelectedCategory(previousCategory);

      const categoryParam =
        previousCategory === "ALL" ? undefined : previousCategory;
      fetchAnnouncements(categoryParam);
    }
  };

  const renderAnnouncementCard = ({ item }: { item: AnnouncementDto }) => (
    <TouchableOpacity
      style={globalStyles.announcementCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
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
      </View>
    </TouchableOpacity>
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        currentCategory={selectedCategory}
      />

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
          onPress={() => setShowSearchModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>
      </View>

      {isSearchMode && (
        <View style={globalStyles.searchIndicator}>
          <Ionicons name="search" size={16} color={colors.richOxblood} />
          <Text style={globalStyles.searchIndicatorText}>
            Searching for "{searchQuery}"
          </Text>
          <TouchableOpacity
            onPress={() => handleSearch("")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.richOxblood}
            />
          </TouchableOpacity>
        </View>
      )}

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
              if (isSearchMode && searchQuery) {
                fetchAnnouncements(undefined, searchQuery);
              } else {
                const categoryParam =
                  selectedCategory === "ALL" ? undefined : selectedCategory;
                fetchAnnouncements(categoryParam);
              }
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
