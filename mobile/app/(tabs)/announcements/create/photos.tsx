import React, { useState } from "react";
import { StyleSheet } from "react-native";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCreateAnnouncement } from "../../../../contexts/CreateAnnouncementContext";
import { globalStyles, colors } from "../../../../styles";
import { PhotoData } from "../../../../types/announcement";

const { width } = Dimensions.get("window");
const photoSize = (width - 60) / 3;

export default function PhotosScreen() {
  const {
    formData,
    addPhoto,
    removePhoto,
    updatePhotos,
    validateStep2,
    canProceedToStep,
  } = useCreateAnnouncement();

  const [isLoading, setIsLoading] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Request camera and media library permissions
  const requestPermissions = async () => {
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
      camera: cameraResult.status === "granted",
      media: mediaResult.status === "granted",
    };
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      setIsLoading(true);

      const permissions = await requestPermissions();
      if (!permissions.camera) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access to take photos.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photo: PhotoData = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize,
        };

        addPhoto(photo);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pick photo from gallery
  const pickFromGallery = async () => {
    try {
      setIsLoading(true);

      const permissions = await requestPermissions();
      if (!permissions.media) {
        Alert.alert(
          "Media Library Permission Required",
          "Please enable media library access to select photos.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10 - formData.photos.length, // Limit based on current photos
      });

      if (!result.canceled && result.assets) {
        const newPhotos: PhotoData[] = result.assets.map(
          (asset: any, index: number) => ({
            id: `${Date.now()}_${index}`,
            uri: asset.uri,
            name: `photo_${Date.now()}_${index}.jpg`,
            type: "image/jpeg",
            size: asset.fileSize,
          })
        );

        // Add all selected photos
        newPhotos.forEach((photo) => addPhoto(photo));
      }
    } catch (error) {
      console.error("Error picking from gallery:", error);
      Alert.alert("Error", "Failed to select photos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = (photoId: string) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removePhoto(photoId),
      },
    ]);
  };

  // Handle continue to next step
  const handleContinue = () => {
    const validation = validateStep2();

    if (!validation.isValid) {
      Alert.alert(
        "Please fix the following errors:",
        validation.errors.join("\n")
      );
      return;
    }

    // Navigate to location screen
    router.push("/announcements/create/location");
  };

  // Handle skip photos
  const handleSkip = () => {
    router.push("/announcements/create/location");
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

        <Text style={globalStyles.announcementsHeaderTitle}>Add Photos</Text>

        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={photoStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={photoStyles.progressContainer}>
        <View style={photoStyles.progressBar}>
          <View
            style={[photoStyles.progressStep, photoStyles.progressStepActive]}
          />
          <View
            style={[photoStyles.progressStep, photoStyles.progressStepActive]}
          />
          <View style={photoStyles.progressStep} />
        </View>
        <Text style={photoStyles.progressText}>Step 2 of 3</Text>
      </View>

      <ScrollView
        style={photoStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={photoStyles.container}>
          {/* Header Section */}
          <View style={photoStyles.headerSection}>
            <Ionicons
              name="camera"
              size={64}
              color={colors.richOxblood}
              style={photoStyles.headerIcon}
            />
            <Text style={photoStyles.title}>Select a picture by</Text>
            <Text style={photoStyles.subtitle}>
              Taking a photo or uploading an image
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={photoStyles.actionButtons}>
            <TouchableOpacity
              style={[photoStyles.actionButton, photoStyles.cameraButton]}
              onPress={takePhoto}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={24} color={colors.white} />
              <Text style={photoStyles.actionButtonText}>Take a photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[photoStyles.actionButton, photoStyles.galleryButton]}
              onPress={pickFromGallery}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={24} color={colors.richOxblood} />
              <Text
                style={[
                  photoStyles.actionButtonText,
                  photoStyles.galleryButtonText,
                ]}
              >
                Upload an image
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Counter */}
          <Text style={photoStyles.photoCounter}>
            {formData.photos.length}/10 photos selected
          </Text>

          {/* Selected Photos Grid */}
          {formData.photos.length > 0 && (
            <View style={photoStyles.photosSection}>
              <Text style={photoStyles.sectionTitle}>Selected Photos</Text>

              <View style={photoStyles.photosGrid}>
                {formData.photos.map((photo) => (
                  <View key={photo.id} style={photoStyles.photoContainer}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={photoStyles.photoImage}
                      resizeMode="cover"
                    />

                    <TouchableOpacity
                      style={photoStyles.removeButton}
                      onPress={() => handleRemovePhoto(photo.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={photoStyles.instructionsSection}>
            <Text style={photoStyles.instructionsTitle}>Photo Tips:</Text>
            <Text style={photoStyles.instructionText}>
              • Add multiple angles of the item
            </Text>
            <Text style={photoStyles.instructionText}>
              • Make sure photos are clear and well-lit
            </Text>
            <Text style={photoStyles.instructionText}>
              • Include any distinctive features or damage
            </Text>
            <Text style={photoStyles.instructionText}>
              • Maximum 10 photos allowed
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={photoStyles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={photoStyles.continueButtonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const photoStyles = StyleSheet.create({
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
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 24,
  },

  // Action Buttons
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  cameraButton: {
    backgroundColor: colors.richOxblood,
  },
  galleryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.richOxblood,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
  galleryButtonText: {
    color: colors.richOxblood,
  },

  // Photo Counter
  photoCounter: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "center" as const,
    marginBottom: 24,
  },

  // Photos Section
  photosSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  photoContainer: {
    position: "relative" as const,
    width: photoSize,
    height: photoSize,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute" as const,
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Instructions
  instructionsSection: {
    backgroundColor: colors.softRose,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Continue Button
  continueButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.richOxblood,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
});
