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
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: "" });
  const [locationError, setLocationError] = useState<string | null>(null);

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
          "Permission Required",
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
      let city = "";
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const parts = [
          addr.streetNumber,
          addr.street,
          addr.city,
          addr.postalCode,
        ].filter(Boolean);
        address = parts.join(", ");
        city = addr.city || addr.region || "";
      }

      const locationData: LocationData = {
        latitude,
        longitude,
        address: address || undefined,
        isLocationApproximate: false,
      };

      setCurrentLocation(locationData);
      updateLocation(locationData);

      // Clear manual address when GPS is used
      setManualAddress("");
      setAddressValidation({ isValid: null, message: "" });
    } catch (error: any) {
      console.error("Error getting current location:", error);
      setLocationError(
        "Failed to get current location. Please try again or enter address manually."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Validate manual address with debounce
  const validateAddress = async (address: string) => {
    if (address.length < 10) {
      setAddressValidation({ isValid: null, message: "" });
      return;
    }

    try {
      setIsValidatingAddress(true);

      // Try to geocode the address to see if it's valid
      const result = await Location.geocodeAsync(address);

      if (result.length > 0) {
        const coords = result[0];
        setAddressValidation({
          isValid: true,
          message: "Valid address format",
        });

        // Update location with geocoded coordinates
        const locationData: LocationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: address.trim(),
          isLocationApproximate: true,
        };

        updateLocation(locationData);
        setCurrentLocation(null); // Clear GPS location
      } else {
        setAddressValidation({
          isValid: false,
          message: "Address not found. Try: Street, City, Postal Code",
        });
        updateLocation(null);
      }
    } catch (error) {
      setAddressValidation({
        isValid: false,
        message: "Invalid address format",
      });
      updateLocation(null);
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Handle manual address change with debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (manualAddress.trim()) {
        validateAddress(manualAddress.trim());
      } else {
        setAddressValidation({ isValid: null, message: "" });
        updateLocation(null);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [manualAddress]);

  // Handle manual address input
  const handleAddressChange = (address: string) => {
    setManualAddress(address);

    // Clear GPS location when user types manually
    if (address.trim() && currentLocation) {
      setCurrentLocation(null);
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

          {/* Primary: Current Location Button */}
          <View style={locationStyles.section}>
            <TouchableOpacity
              style={[
                locationStyles.primaryLocationButton,
                currentLocation && locationStyles.primaryLocationButtonActive,
              ]}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
              activeOpacity={0.8}
            >
              <Ionicons
                name="navigate"
                size={24}
                color={currentLocation ? colors.white : colors.richOxblood}
              />
              <View style={locationStyles.buttonTextContainer}>
                <Text
                  style={[
                    locationStyles.primaryButtonText,
                    currentLocation && locationStyles.primaryButtonTextActive,
                  ]}
                >
                  Use My Current Location
                </Text>
                <Text
                  style={[
                    locationStyles.primaryButtonHint,
                    currentLocation && locationStyles.primaryButtonHintActive,
                  ]}
                >
                  Most accurate option
                </Text>
              </View>
              {isGettingLocation && (
                <ActivityIndicator
                  size="small"
                  color={currentLocation ? colors.white : colors.richOxblood}
                />
              )}
            </TouchableOpacity>

            {/* GPS Success Display */}
            {currentLocation && (
              <View style={locationStyles.gpsSuccess}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={locationStyles.gpsSuccessText}>
                  Location detected successfully
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
          </View>

          {/* OR Divider */}
          <View style={locationStyles.orDivider}>
            <View style={locationStyles.orLine} />
            <Text style={locationStyles.orText}>OR</Text>
            <View style={locationStyles.orLine} />
          </View>

          {/* Manual Address Section */}
          <View style={locationStyles.section}>
            <Text style={locationStyles.sectionTitle}>
              Enter Address Manually
            </Text>

            <TextInput
              style={[
                locationStyles.addressInput,
                addressValidation.isValid === true &&
                  locationStyles.addressInputValid,
                addressValidation.isValid === false &&
                  locationStyles.addressInputInvalid,
              ]}
              placeholder="5 Boulevard Édouard Rey, Grenoble, 38000"
              placeholderTextColor={colors.text.secondary}
              value={manualAddress}
              onChangeText={handleAddressChange}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />

            {/* Address Validation Feedback */}
            {isValidatingAddress && (
              <View style={locationStyles.validationContainer}>
                <ActivityIndicator size="small" color={colors.richOxblood} />
                <Text style={locationStyles.validatingText}>
                  Checking address...
                </Text>
              </View>
            )}

            {addressValidation.message && !isValidatingAddress && (
              <View style={locationStyles.validationContainer}>
                {addressValidation.isValid === true ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                ) : (
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.danger}
                  />
                )}
                <Text
                  style={[
                    locationStyles.validationText,
                    addressValidation.isValid === true &&
                      locationStyles.validationTextSuccess,
                    addressValidation.isValid === false &&
                      locationStyles.validationTextError,
                  ]}
                >
                  {addressValidation.isValid === true
                    ? "Valid address format"
                    : "Invalid address format"}
                </Text>
              </View>
            )}

            {/* Format Hint */}
            <View style={locationStyles.hintContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.richOxblood}
              />
              <Text style={locationStyles.formatHint}>
                Format: Number, Street Name, City, Postal Code
              </Text>
            </View>
            <View style={locationStyles.exampleContainer}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={locationStyles.exampleText}>
                Exemple: 5 Boulevard Édouard Rey, Grenoble, 38000
              </Text>
            </View>

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
              <View style={locationStyles.summaryValueContainer}>
                {currentLocation ? (
                  <>
                    <Ionicons
                      name="navigate"
                      size={14}
                      color={colors.success}
                    />
                    <Text style={locationStyles.summaryValue}>
                      GPS location detected
                    </Text>
                  </>
                ) : manualAddress && addressValidation.isValid === true ? (
                  <>
                    <Ionicons
                      name="create-outline"
                      size={14}
                      color={colors.success}
                    />
                    <Text style={locationStyles.summaryValue}>
                      Manual address entered
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.text.secondary}
                    />
                    <Text style={locationStyles.summaryValue}>
                      No location provided
                    </Text>
                  </>
                )}
              </View>
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

  // Primary Location Button
  primaryLocationButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.richOxblood,
    backgroundColor: colors.surface,
    gap: 16,
    marginBottom: 12,
  },
  primaryLocationButtonActive: {
    backgroundColor: colors.richOxblood,
    borderColor: colors.richOxblood,
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.richOxblood,
    marginBottom: 4,
  },
  primaryButtonTextActive: {
    color: colors.white,
  },
  primaryButtonHint: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
  },
  primaryButtonHintActive: {
    color: colors.white,
  },

  // GPS Success Display
  gpsSuccess: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 8,
    padding: 12,
  },
  gpsSuccessText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.success,
    fontWeight: "500" as const,
  },

  // OR Divider
  orDivider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  orText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
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
    height: 100,
    textAlignVertical: "top" as const,
    marginBottom: 8,
  },
  addressInputValid: {
    borderColor: colors.success,
    backgroundColor: "#f0f9ff",
  },
  addressInputInvalid: {
    borderColor: colors.danger,
    backgroundColor: "#fef2f2",
  },

  // Validation Feedback
  validationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  validatingText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.richOxblood,
  },
  validationText: {
    fontSize: 14,
    fontFamily: "Nunito",
    fontWeight: "500" as const,
  },
  validationTextSuccess: {
    color: colors.success,
  },
  validationTextError: {
    color: colors.danger,
  },

  // Format Hints
  hintContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 4,
  },
  formatHint: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.richOxblood,
    fontWeight: "500" as const,
  },
  exampleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    fontStyle: "italic" as const,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "right" as const,
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
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.danger,
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
    alignItems: "flex-start" as const,
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
    marginLeft: 4,
  },
  summaryValueContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
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
