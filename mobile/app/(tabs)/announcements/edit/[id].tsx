// app/(tabs)/announcements/edit/[id].tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { globalStyles, colors } from "../../../../styles";
import {
  announcementService,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../../../services/announcement";
import { fileUploadService } from "../../../../services/fileUpload";
import { AnnouncementDto, FileDto } from "../../../../types/announcement";
import Toast from "react-native-toast-message";

// Category options
const CATEGORIES = [
  { key: "ELECTRONICS", label: "Electronics", icon: "phone-portrait-outline" },
  { key: "CLOTHING", label: "Clothing", icon: "shirt-outline" },
  { key: "DOCUMENTS", label: "Documents", icon: "document-text-outline" },
  { key: "BAGS", label: "Bags", icon: "bag-outline" },
  { key: "KEYS", label: "Keys", icon: "key-outline" },
  { key: "JEWELRY", label: "Jewelry", icon: "diamond-outline" },
  { key: "BOOKS", label: "Books", icon: "book-outline" },
  { key: "HOUSEHOLD", label: "Household", icon: "home-outline" },
  { key: "VEHICLE", label: "Vehicle", icon: "car-outline" },
  { key: "SPORTS", label: "Sports", icon: "football-outline" },
  { key: "PETS", label: "Pets", icon: "paw-outline" },
  { key: "WALLET", label: "Wallet", icon: "wallet-outline" },
] as const;

// Status options
const STATUS_OPTIONS = [
  {
    key: "ACTIVE",
    label: "Still Looking",
    icon: "search",
    color: colors.richOxblood,
  },
  {
    key: "RESOLVED",
    label: "Found/Returned",
    icon: "checkmark-circle",
    color: "#22c55e",
  },
  { key: "ARCHIVED", label: "Archive", icon: "archive", color: "#6b7280" },
] as const;

export default function EditAnnouncementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const announcementId = parseInt(id || "0");

  // State
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(
    null
  );
  const [photos, setPhotos] = useState<FileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "ACTIVE" as "ACTIVE" | "RESOLVED" | "ARCHIVED",
    incidentDate: "",
    contactInfo: "",
  });

  // Load announcement data
  useEffect(() => {
    loadAnnouncement();
  }, [announcementId]);

  const loadAnnouncement = async () => {
    try {
      setIsLoading(true);

      // Load announcement details
      const announcementData =
        await announcementService.getAnnouncementById(announcementId);

      if (!announcementData) {
        Alert.alert("Error", "Announcement not found");
        router.back();
        return;
      }

      setAnnouncement(announcementData);

      // Pre-fill form
      setFormData({
        title: announcementData.title,
        description: announcementData.description,
        category: announcementData.category,
        status: announcementData.status as "ACTIVE" | "RESOLVED" | "ARCHIVED",
        incidentDate: announcementData.incidentDate,
        contactInfo: announcementData.contactInfo || "",
      });

      // Load photos
      try {
        const photoData =
          await fileUploadService.getAnnouncementPhotosForEdit(announcementId);
        setPhotos(photoData.files);
      } catch (photoError) {
        console.error("Failed to load photos:", photoError);
        // Continue without photos
      }
    } catch (error: any) {
      console.error("Failed to load announcement:", error);
      Alert.alert("Error", "Failed to load announcement data");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form updates
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField("incidentDate", selectedDate.toISOString());
    }
  };

  // Delete photo
  const handleDeletePhoto = async (fileId: number) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fileUploadService.deletePhoto(fileId);
            setPhotos((prev) => prev.filter((photo) => photo.id !== fileId));
            Toast.show({
              type: "success",
              text1: "Photo deleted successfully",
            });
          } catch (error: any) {
            Toast.show({
              type: "error",
              text1: "Failed to delete photo",
              text2: error.message,
            });
          }
        },
      },
    ]);
  };

  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors([]);

      // Validation
      const validationErrors: string[] = [];
      if (!formData.title.trim()) validationErrors.push("Title is required");
      if (!formData.description.trim())
        validationErrors.push("Description is required");
      if (!formData.category) validationErrors.push("Category is required");

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        Alert.alert(
          "Please fix the following errors:",
          validationErrors.join("\n")
        );
        return;
      }

      // Update announcement
      await updateAnnouncement(announcementId, {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        status: formData.status,
        incidentDate: formData.incidentDate,
        contactInfo: formData.contactInfo,
      });

      Toast.show({
        type: "success",
        text1: "Announcement updated successfully",
      });

      router.back();
    } catch (error: any) {
      console.error("Failed to update announcement:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update announcement",
        text2: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete announcement
  const handleDelete = async () => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnnouncement(announcementId);
              Toast.show({
                type: "success",
                text1: "Announcement deleted successfully",
              });
              router.push("/(tabs)/profile/my-announcements");
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Failed to delete announcement",
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          globalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.richOxblood} />
        <Text style={[globalStyles.bodyText, { marginTop: 16 }]}>
          Loading...
        </Text>
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
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <Text style={globalStyles.announcementsHeaderTitle}>
          Edit Announcement
        </Text>

        <TouchableOpacity
          style={globalStyles.headerButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Type Display (Read-only) */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Type (Cannot be changed)</Text>
            <View
              style={[
                styles.typeDisplay,
                {
                  backgroundColor:
                    announcement?.type === "LOST" ? "#fee2e2" : "#ecfdf5",
                  borderColor:
                    announcement?.type === "LOST" ? "#fca5a5" : "#86efac",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      announcement?.type === "LOST" ? "#dc2626" : "#16a34a",
                  },
                ]}
              >
                {announcement?.type}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusContainer}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.statusButton,
                    formData.status === status.key && {
                      backgroundColor: status.color,
                      borderColor: status.color,
                    },
                  ]}
                  onPress={() => updateField("status", status.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={20}
                    color={
                      formData.status === status.key
                        ? colors.white
                        : status.color
                    }
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === status.key && { color: colors.white },
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rest of the form fields... */}
          {/* Title, Description, Category, Date, Contact Info, Photos */}
          {/* (Same structure as create screen but pre-filled) */}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Changes</Text>
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.incidentDate)}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = {
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
    marginBottom: 12,
  },
  typeDisplay: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center" as const,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
  },
  statusContainer: {
    gap: 12,
  },
  statusButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface,
    gap: 12,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "500" as const,
    fontFamily: "Nunito",
    color: colors.text.primary,
  },
  saveButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.richOxblood,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 32,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
};
