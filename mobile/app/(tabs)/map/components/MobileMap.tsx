// app/(tabs)/map/components/MobileMap.tsx - Simplified & Clean
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AnnouncementDto } from "../../../../types/announcement";
import { MapRegion, UserLocation } from "../../../../types/map";

interface MobileMapProps {
  region: MapRegion;
  announcements: AnnouncementDto[];
  userLocation: UserLocation | null;
  onRegionChange: (region: MapRegion) => void;
  onMarkerPress: (announcement: AnnouncementDto) => void;
  style?: any;
}

const { width, height } = Dimensions.get("window");

export default function MobileMap({
  region,
  announcements,
  userLocation,
  onRegionChange,
  onMarkerPress,
  style,
}: MobileMapProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementDto | null>(null);

  const handleMarkerPress = (announcement: AnnouncementDto) => {
    setSelectedAnnouncement(announcement);
    onMarkerPress(announcement);
  };

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  // Handle region change
  const handleRegionChangeComplete = (newRegion: MapRegion) => {
    onRegionChange(newRegion);
  };

  // Navigate to announcement details
  const navigateToDetails = (announcement: AnnouncementDto) => {
    try {
      router.push(`/announcements/${announcement.id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Could not open announcement details");
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Simple Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Map View</Text>
            <Text style={styles.headerSubtitle}>
              {announcements.length} items nearby
            </Text>
          </View>
          {/* Only essential filter button */}
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#7C444F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Real Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          mapType="standard"
        >
          {/* Announcement Markers */}
          {announcements.map((announcement) => {
            if (!announcement.latitude || !announcement.longitude) {
              return null;
            }

            const isSelected = selectedAnnouncement?.id === announcement.id;
            const markerColor =
              announcement.type === "LOST" ? "#FF6B6B" : "#4ECDC4";

            return (
              <Marker
                key={announcement.id}
                coordinate={{
                  latitude: announcement.latitude,
                  longitude: announcement.longitude,
                }}
                title={announcement.title || "No Title"}
                description={`${announcement.type || "ITEM"} • ${announcement.category || "Uncategorized"}`}
                onPress={() => handleMarkerPress(announcement)}
              >
                {/* Simple Custom Marker */}
                <View
                  style={[
                    styles.customMarker,
                    {
                      backgroundColor: markerColor,
                      borderColor: isSelected ? "#7C444F" : "white",
                      borderWidth: isSelected ? 3 : 2,
                      transform: isSelected ? [{ scale: 1.1 }] : [{ scale: 1 }],
                    },
                  ]}
                >
                  <Ionicons
                    name={announcement.type === "LOST" ? "close" : "checkmark"}
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Simple Controls - Only Essential */}
        <View style={styles.mapControls}>
          {/* My Location Button */}
          {userLocation && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={centerOnUser}
            >
              <Ionicons name="locate" size={20} color="#7C444F" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Sheet - Clean & Simple */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />

        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Items Found</Text>
          <Text style={styles.itemCount}>{announcements.length}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsScrollContainer}
        >
          {announcements.map((announcement) => (
            <TouchableOpacity
              key={announcement.id}
              style={[
                styles.itemCard,
                selectedAnnouncement?.id === announcement.id &&
                  styles.itemCardSelected,
              ]}
              onPress={() => navigateToDetails(announcement)}
            >
              <View
                style={[
                  styles.itemTypeIndicator,
                  {
                    backgroundColor:
                      announcement.type === "LOST" ? "#FF6B6B" : "#4ECDC4",
                  },
                ]}
              >
                <Ionicons
                  name={announcement.type === "LOST" ? "close" : "checkmark"}
                  size={12}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.itemTitle} numberOfLines={1}>
                {announcement.title || "No Title"}
              </Text>

              <Text style={styles.itemCategory}>
                {announcement.category || "Uncategorized"}
              </Text>

              {announcement.distanceKm !== undefined &&
                announcement.distanceKm !== null && (
                  <Text style={styles.itemDistance}>
                    📍 {announcement.distanceKm}km away
                  </Text>
                )}

              {/* Clear call to action */}
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 60,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },

  filterButton: {
    backgroundColor: "#FAF7F0",
    padding: 12,
    borderRadius: 12,
  },

  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  map: {
    flex: 1,
  },

  customMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  mapControls: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },

  locationButton: {
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },

  itemCount: {
    fontSize: 16,
    color: "#7C444F",
    fontWeight: "600",
  },

  itemsScrollContainer: {
    paddingRight: 20,
  },

  itemCard: {
    backgroundColor: "#FAF7F0",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemCardSelected: {
    borderColor: "#7C444F",
    borderWidth: 2,
  },

  itemTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },

  itemCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },

  itemDistance: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 8,
  },

  viewButton: {
    backgroundColor: "#7C444F",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
