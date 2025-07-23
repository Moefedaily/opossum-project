import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useCreateAnnouncement } from "../../../../contexts/CreateAnnouncementContext";
import { globalStyles, colors } from "../../../../styles";
import { LocationData } from "../../../../types/announcement";

export default function LocationScreen() {
  const {
    formData,
    updateLocation,
    validateStep3,
    submitAnnouncement,
    isSubmitting,
    resetForm,
  } = useCreateAnnouncement();

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [manualAddress, setManualAddress] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Initialize manual address from form data
  useEffect(() => {
    if (formData.location?.address) {
      setManualAddress(formData.location.address);
    }
  }, []);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Request location permissions
  const requestLocationPermissions = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to use your current location.",
          [{ text: "OK" }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError(null);

      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = "";
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const parts = [
          addr.streetNumber,
          addr.street,
          addr.city,
          addr.region,
          addr.postalCode,
        ].filter(Boolean);
        address = parts.join(", ");
      }

      const locationData: LocationData = {
        latitude,
        longitude,
        address: address || undefined,
        isLocationApproximate: false,
      };

      setCurrentLocation(locationData);
      setUseCurrentLocation(true);
      updateLocation(locationData);
    } catch (error: any) {
      console.error("Error getting current location:", error);
      setLocationError(
        "Failed to get current location. Please try again or enter manually."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle manual address change
  const handleAddressChange = (address: string) => {
    setManualAddress(address);

    if (useCurrentLocation) {
      // Update current location with new address
      if (currentLocation) {
        const updatedLocation: LocationData = {
          ...currentLocation,
          address: address || undefined,
        };
        updateLocation(updatedLocation);
      }
    } else {
      // Manual address only (no coordinates)
      if (address.trim()) {
        const locationData: LocationData = {
          latitude: 0, // Placeholder - backend should handle manual addresses
          longitude: 0, // Placeholder - backend should handle manual addresses
          address: address.trim(),
          isLocationApproximate: true,
        };
        updateLocation(locationData);
      } else {
        updateLocation(null);
      }
    }
  };

  // Toggle between GPS and manual address
  const handleLocationModeToggle = () => {
    if (useCurrentLocation) {
      // Switch to manual address only
      setUseCurrentLocation(false);
      setCurrentLocation(null);

      if (manualAddress.trim()) {
        const locationData: LocationData = {
          latitude: 0,
          longitude: 0,
          address: manualAddress.trim(),
          isLocationApproximate: true,
        };
        updateLocation(locationData);
      } else {
        updateLocation(null);
      }
    } else {
      // Switch to GPS location
      getCurrentLocation();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const validation = validateStep3();

      if (!validation.isValid) {
        Alert.alert(
          "Please fix the following errors:",
          validation.errors.join("\n")
        );
        return;
      }

      const result = await submitAnnouncement();

      if (result.success) {
        Alert.alert(
          "Success!",
          "Your announcement has been created successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                // Navigate back to announcements list
                router.replace("/announcements");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.error || "Failed to create announcement. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Error submitting announcement:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  // Skip location and submit
  const handleSkipLocation = () => {
    updateLocation(null);
    handleSubmit();
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

        <Text style={globalStyles.announcementsHeaderTitle}>
          Location & Submit
        </Text>

        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleSkipLocation}
          activeOpacity={0.7}
          disabled={isSubmitting}
        >
          <Text style={locationStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={locationStyles.progressContainer}>
        <View style={locationStyles.progressBar}>
          <View
            style={[
              locationStyles.progressStep,
              locationStyles.progressStepActive,
            ]}
          />
          <View
            style={[
              locationStyles.progressStep,
              locationStyles.progressStepActive,
            ]}
          />
          <View
            style={[
              locationStyles.progressStep,
              locationStyles.progressStepActive,
            ]}
          />
        </View>
        <Text style={locationStyles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView
        style={locationStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={locationStyles.container}>
          {/* Header Section */}
          <View style={locationStyles.headerSection}>
            <Ionicons name="location" size={64} color={colors.richOxblood} />
            <Text style={locationStyles.title}>Add Location</Text>
            <Text style={locationStyles.subtitle}>
              Help others find the item by adding location information
            </Text>
          </View>

          {/* Location Options */}
          <View style={locationStyles.section}>
            <Text style={locationStyles.sectionTitle}>Location Options</Text>

            {/* GPS Location Button */}
            <TouchableOpacity
              style={[
                locationStyles.locationOption,
                useCurrentLocation && locationStyles.locationOptionActive,
              ]}
              onPress={handleLocationModeToggle}
              disabled={isGettingLocation}
              activeOpacity={0.8}
            >
              <View style={locationStyles.locationOptionContent}>
                <Ionicons
                  name="navigate"
                  size={24}
                  color={useCurrentLocation ? colors.white : colors.richOxblood}
                />
                <View style={locationStyles.locationOptionText}>
                  <Text
                    style={[
                      locationStyles.locationOptionTitle,
                      useCurrentLocation &&
                        locationStyles.locationOptionTitleActive,
                    ]}
                  >
                    Use Current Location
                  </Text>
                  <Text
                    style={[
                      locationStyles.locationOptionSubtitle,
                      useCurrentLocation &&
                        locationStyles.locationOptionSubtitleActive,
                    ]}
                  >
                    Get your precise GPS coordinates
                  </Text>
                </View>
              </View>

              {isGettingLocation && (
                <ActivityIndicator size="small" color={colors.white} />
              )}
            </TouchableOpacity>

            {/* Manual Address Option */}
            <TouchableOpacity
              style={[
                locationStyles.locationOption,
                !useCurrentLocation && locationStyles.locationOptionActive,
              ]}
              onPress={() => !useCurrentLocation && handleLocationModeToggle()}
              activeOpacity={0.8}
            >
              <View style={locationStyles.locationOptionContent}>
                <Ionicons
                  name="create"
                  size={24}
                  color={
                    !useCurrentLocation ? colors.white : colors.richOxblood
                  }
                />
                <View style={locationStyles.locationOptionText}>
                  <Text
                    style={[
                      locationStyles.locationOptionTitle,
                      !useCurrentLocation &&
                        locationStyles.locationOptionTitleActive,
                    ]}
                  >
                    Enter Manually
                  </Text>
                  <Text
                    style={[
                      locationStyles.locationOptionSubtitle,
                      !useCurrentLocation &&
                        locationStyles.locationOptionSubtitleActive,
                    ]}
                  >
                    Type the address or area
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Current Location Display */}
          {currentLocation && useCurrentLocation && (
            <View style={locationStyles.section}>
              <Text style={locationStyles.sectionTitle}>Current Location</Text>
              <View style={locationStyles.locationDisplay}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={locationStyles.locationDisplayText}>
                  Location acquired successfully
                </Text>
              </View>
              <Text style={locationStyles.coordinatesText}>
                📍 {currentLocation.latitude.toFixed(6)},{" "}
                {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Location Error */}
          {locationError && (
            <View style={locationStyles.errorContainer}>
              <Ionicons name="warning" size={20} color={colors.danger} />
              <Text style={locationStyles.errorText}>{locationError}</Text>
            </View>
          )}

          {/* Address Input */}
          <View style={locationStyles.section}>
            <Text style={locationStyles.sectionTitle}>
              Address
              <Text style={locationStyles.optionalText}> (Optional)</Text>
            </Text>
            <TextInput
              style={locationStyles.addressInput}
              placeholder="Enter address, street, or area description..."
              placeholderTextColor={colors.text.secondary}
              value={manualAddress}
              onChangeText={handleAddressChange}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={locationStyles.characterCount}>
              {manualAddress.length}/500
            </Text>
          </View>

          {/* Summary Section */}
          <View style={locationStyles.summarySection}>
            <Text style={locationStyles.summaryTitle}>Review Your Post</Text>

            <View style={locationStyles.summaryItem}>
              <Text style={locationStyles.summaryLabel}>Type:</Text>
              <Text style={locationStyles.summaryValue}>
                {formData.type} - {formData.category}
              </Text>
            </View>

            <View style={locationStyles.summaryItem}>
              <Text style={locationStyles.summaryLabel}>Title:</Text>
              <Text style={locationStyles.summaryValue}>{formData.title}</Text>
            </View>

            <View style={locationStyles.summaryItem}>
              <Text style={locationStyles.summaryLabel}>Photos:</Text>
              <Text style={locationStyles.summaryValue}>
                {formData.photos.length} photo
                {formData.photos.length !== 1 ? "s" : ""} added
              </Text>
            </View>

            <View style={locationStyles.summaryItem}>
              <Text style={locationStyles.summaryLabel}>Location:</Text>
              <Text style={locationStyles.summaryValue}>
                {formData.location
                  ? formData.location.address || "GPS coordinates provided"
                  : "No location provided"}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              locationStyles.submitButton,
              isSubmitting && locationStyles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="checkmark" size={20} color={colors.white} />
            )}
            <Text style={locationStyles.submitButtonText}>
              {isSubmitting ? "Creating..." : "Create Announcement"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const locationStyles = {
  // Progress indicator
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  progressBar: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.richOxblood,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "center" as const,
  },
  skipText: {
    fontSize: 16,
    fontFamily: "DMSans",
    color: colors.text.secondary,
  },

  // Layout
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },

  // Header Section
  headerSection: {
    alignItems: "center" as const,
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    textAlign: "center" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 24,
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
  optionalText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.text.secondary,
  },

  // Location Options
  locationOption: {
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  locationOptionActive: {
    borderColor: colors.richOxblood,
    backgroundColor: colors.richOxblood,
  },
  locationOptionContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  locationOptionText: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 4,
  },
  locationOptionTitleActive: {
    color: colors.white,
  },
  locationOptionSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
  },
  locationOptionSubtitleActive: {
    color: colors.white,
  },

  // Location Display
  locationDisplay: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: colors.softRose,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationDisplayText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.success,
    fontWeight: "500" as const,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.text.secondary,
  },

  // Error Display
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.danger,
  },

  // Address Input
  addressInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
    backgroundColor: colors.surface,
    height: 80,
    textAlignVertical: "top" as const,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "right" as const,
    marginTop: 4,
  },

  // Summary Section
  summarySection: {
    backgroundColor: colors.softRose,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row" as const,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    fontFamily: "DMSans",
    color: colors.text.secondary,
    width: 80,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.primary,
  },

  // Submit Button
  submitButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.richOxblood,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
};
