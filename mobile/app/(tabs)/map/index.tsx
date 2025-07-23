// app/(tabs)/map/index.tsx - FIXED TEXT RENDERING ISSUES
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
import { UserLocation, MapRegion } from "../../../types/map";
import Map from "./components/Map";

export default function MapScreen() {
  // State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [mapRegion, setMapRegion] = useState<MapRegion>(
    mapService.getDefaultMapRegion()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [showList, setShowList] = useState(false);

  // Initialize map
  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      await getUserLocation();
      await loadNearbyAnnouncements();
    } catch (error) {
      console.error("Error initializing map:", error);
      await loadNearbyAnnouncements();
    } finally {
      setIsLoading(false);
    }
  };

  // Get user location
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

  // Load nearby announcements
  const loadNearbyAnnouncements = async () => {
    try {
      const searchLocation = userLocation || {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      };

      const items = await mapService.getNearbyAnnouncements({
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radiusKm: searchRadius,
      });

      setAnnouncements(items);
    } catch (error: any) {
      Alert.alert("Error", "Could not load announcements.");
      console.error("Error loading announcements:", error);
    }
  };

  // Search current area when map region changes
  const searchCurrentArea = async () => {
    try {
      const items = await mapService.getAnnouncementsInRegion(mapRegion);
      setAnnouncements(items);
    } catch (error: any) {
      console.error("Error searching area:", error);
      // Don't show alert for automatic searches, just log
    }
  };

  // Handle map region change (throttled to avoid too many API calls)
  const handleRegionChange = (region: MapRegion) => {
    setMapRegion(region);
    // Debounce the search to avoid too many API calls
    setTimeout(() => {
      searchCurrentArea();
    }, 1500);
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
            // Navigate to announcement detail page
            const announcementPath =
              `/announcement/${announcement.id}` as const;
            router.push(announcementPath);
          },
        },
      ]
    );
  };

  // Render announcement item for list view
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

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C444F" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Show list view
  if (showList) {
    return (
      <View style={styles.container}>
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Header for list view */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowList(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#7C444F" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>All Items</Text>
            <Text style={styles.headerSubtitle}>
              {announcements.length} items found
            </Text>
          </View>
        </View>
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

        {/* My Location Button */}
        <TouchableOpacity
          style={[styles.fab, styles.locationFab]}
          onPress={getUserLocation}
          disabled={isLoadingLocation}
          activeOpacity={0.8}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="locate" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Search This Area Button */}
        <TouchableOpacity
          style={[styles.fab, styles.searchFab]}
          onPress={searchCurrentArea}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    paddingTop: 100, // Account for header
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
    bottom: 100,
    alignItems: "center",
  },
  fab: {
    width: 56,
    height: 56,
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
  locationFab: {
    backgroundColor: "#4ECDC4",
  },
  searchFab: {
    backgroundColor: "#FF6B6B",
    width: 48,
    height: 48,
    borderRadius: 24,
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
