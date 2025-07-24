// app/(tabs)/map/index.tsx - UPDATED with filter functionality
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { mapService } from "../../../services/map";
import { AnnouncementDto } from "../../../types/announcement";
import { UserLocation, MapRegion, FilterState } from "../../../types/map";
import Map from "./components/Map";
import FilterModal from "./components/FilterModal"; // 🆕 Import your filter modal

export default function MapScreen() {
  // Existing state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [mapRegion, setMapRegion] = useState<MapRegion>(
    mapService.getDefaultMapRegion()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showList, setShowList] = useState(false);

  // 🆕 NEW: Filter state
  const [filters, setFilters] = useState<FilterState>({
    type: "ALL",
    radius: 10,
    category: "ALL",
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Initialize map
  useEffect(() => {
    initializeMap();
  }, []);

  // Load announcements when filters change
  useEffect(() => {
    if (userLocation) {
      loadNearbyAnnouncementsWithFilters();
    }
  }, [filters, userLocation]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      await getUserLocation();
      await loadNearbyAnnouncementsWithFilters();
    } catch (error) {
      console.error("Error initializing map:", error);
      await loadNearbyAnnouncementsWithFilters();
    } finally {
      setIsLoading(false);
    }
  };

  // Get user location (unchanged)
  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await mapService.getCurrentLocation();
      setUserLocation(location);

      const newRegion = mapService.getDefaultMapRegion(location);
      setMapRegion(newRegion);
    } catch (error: any) {
      Alert.alert(
        "Location Error",
        "Could not get your location. Using default location.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  //Load announcements with current filters
  const loadNearbyAnnouncementsWithFilters = async () => {
    try {
      // 🎯 FIXED: Always use current map center for search
      const searchLocation = {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      };

      // Convert filter state to API parameters
      const params = {
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radiusKm: filters.radius,
        ...(filters.type !== "ALL" && {
          type: filters.type as "LOST" | "FOUND",
        }),
        ...(filters.category !== "ALL" && { category: filters.category }),
      };

      console.log("🔍 Searching map center with filters:", params);

      const items = await mapService.getNearbyAnnouncements(params);
      setAnnouncements(items);
    } catch (error: any) {
      Alert.alert("Error", "Could not load announcements.");
      console.error("Error loading announcements:", error);
    }
  };
  // Handle map region change (throttled to avoid too many API calls)
  let searchTimeout: NodeJS.Timeout | null = null;

  const handleRegionChange = (region: MapRegion) => {
    setMapRegion(region);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      console.log("🗺️ Map moved to:", region.latitude, region.longitude);
      loadNearbyAnnouncementsWithFilters();
    }, 2000);
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: FilterState) => {
    console.log("🔧 Applying new filters:", newFilters);
    setFilters(newFilters);
    setShowFilterModal(false);
    // loadNearbyAnnouncementsWithFilters will be called by useEffect
  };

  // Handle marker press - Show details
  const showAnnouncementDetails = (announcement: AnnouncementDto) => {
    const distanceText = announcement.distanceKm
      ? `\n\n📍 ${announcement.distanceKm}km away`
      : "";

    const description = announcement.description || "";
    const truncatedDescription =
      description.length > 150
        ? description.substring(0, 150) + "..."
        : description;

    Alert.alert(
      announcement.title || "Announcement",
      `${announcement.type || "ITEM"} • ${announcement.category || "UNCATEGORIZED"}\n\n${truncatedDescription}${distanceText}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "View Full Details",
          onPress: () => {
            const announcementPath =
              `/announcements/${announcement.id}` as const;
            router.push(announcementPath);
          },
        },
      ]
    );
  };

  // Render announcement item for list view (unchanged)
  const renderAnnouncementItem = ({ item }: { item: AnnouncementDto }) => (
    <TouchableOpacity
      style={styles.announcementCard}
      onPress={() => showAnnouncementDetails(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title || "No Title"}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: item.type === "LOST" ? "#FF6B6B" : "#4ECDC4" },
          ]}
        >
          <Text style={styles.typeBadgeText}>{item.type || "ITEM"}</Text>
        </View>
      </View>
      <Text style={styles.cardCategory}>
        {item.category || "Uncategorized"}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description || "No description available"}
      </Text>
      {item.distanceKm !== undefined && item.distanceKm !== null && (
        <Text style={styles.cardDistance}>📍 {item.distanceKm}km away</Text>
      )}
    </TouchableOpacity>
  );

  // 🆕 NEW: Get filter summary for display
  const getFilterSummary = () => {
    const parts = [];
    if (filters.type !== "ALL") parts.push(filters.type.toLowerCase());
    if (filters.category !== "ALL") parts.push(filters.category.toLowerCase());
    parts.push(`${filters.radius}km radius`);
    return parts.join(" • ");
  };

  // Loading screen (unchanged)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C444F" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Show list view (unchanged)
  if (showList) {
    return (
      <View style={styles.container}>
        {/* Header for list view - FIXED positioning */}
        <View style={styles.listHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowList(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#7C444F" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>All Items</Text>
            <Text style={styles.headerSubtitle}>
              {announcements.length} items • {getFilterSummary()}
            </Text>
          </View>
        </View>

        {/* FlatList with proper top padding */}
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          style={styles.listFlatList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Show map view (default)
  return (
    <View style={styles.container}>
      {/* Beautiful Map Component */}
      <Map
        region={mapRegion}
        announcements={announcements}
        userLocation={userLocation}
        onRegionChange={handleRegionChange}
        onMarkerPress={showAnnouncementDetails}
        style={styles.map}
        filters={filters}
        onOpenFilters={() => setShowFilterModal(true)}
      />

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {/* List View Toggle */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowList(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="list" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF7F0",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "System",
  },
  map: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  listHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  listFlatList: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 272,
    alignItems: "center",
  },
  fab: {
    width: 50,
    height: 50,
    backgroundColor: "#7C444F",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardCategory: {
    fontSize: 14,
    color: "#7C444F",
    fontWeight: "500",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDistance: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
