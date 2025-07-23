import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCreateAnnouncement } from "../../../../contexts/CreateAnnouncementContext";
import { globalStyles, colors } from "../../../../styles";
import { getCategoryIcon } from "../../../../services/announcement";

// Category options matching backend
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

export default function BasicInfoScreen() {
  const { formData, updateBasicInfo, validateStep1, canProceedToStep } =
    useCreateAnnouncement();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle post type selection
  const handleTypeSelect = (type: "LOST" | "FOUND") => {
    updateBasicInfo({ type });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle category selection
  const handleCategorySelect = (
    category: (typeof CATEGORIES)[number]["key"]
  ) => {
    updateBasicInfo({ category });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    updateBasicInfo({ [field]: value });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateBasicInfo({ incidentDate: selectedDate.toISOString() });
    }
  };

  // Handle continue to next step
  const handleContinue = () => {
    const validation = validateStep1();

    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert(
        "Please fix the following errors:",
        validation.errors.join("\n")
      );
      return;
    }

    // Navigate to photos screen
    router.push("/announcements/create/photos");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

        <Text style={globalStyles.announcementsHeaderTitle}>Create Ad</Text>

        <View style={globalStyles.headerButton} />
      </View>

      {/* Progress Indicator */}
      <View style={createStyles.progressContainer}>
        <View style={createStyles.progressBar}>
          <View
            style={[createStyles.progressStep, createStyles.progressStepActive]}
          />
          <View style={createStyles.progressStep} />
          <View style={createStyles.progressStep} />
        </View>
        <Text style={createStyles.progressText}>Step 1 of 3</Text>
      </View>

      <ScrollView
        style={createStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={createStyles.formContainer}>
          {/* Post Type Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>Post Type</Text>
            <View style={createStyles.typeContainer}>
              <TouchableOpacity
                style={[
                  createStyles.typeButton,
                  formData.type === "LOST" && createStyles.typeButtonActive,
                ]}
                onPress={() => handleTypeSelect("LOST")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    createStyles.typeButtonText,
                    formData.type === "LOST" &&
                      createStyles.typeButtonTextActive,
                  ]}
                >
                  LOST
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  createStyles.typeButton,
                  formData.type === "FOUND" && createStyles.typeButtonActive,
                ]}
                onPress={() => handleTypeSelect("FOUND")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    createStyles.typeButtonText,
                    formData.type === "FOUND" &&
                      createStyles.typeButtonTextActive,
                  ]}
                >
                  FOUND
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>Category</Text>
            <View style={createStyles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    createStyles.categoryButton,
                    formData.category === category.key &&
                      createStyles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(category.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={
                      formData.category === category.key
                        ? colors.white
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      createStyles.categoryButtonText,
                      formData.category === category.key &&
                        createStyles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>Title</Text>
            <TextInput
              style={createStyles.textInput}
              placeholder="What did you lose/find?"
              placeholderTextColor={colors.text.secondary}
              value={formData.title}
              onChangeText={(text) => handleInputChange("title", text)}
              maxLength={200}
            />
            <Text style={createStyles.characterCount}>
              {formData.title.length}/200
            </Text>
          </View>

          {/* Description Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>Description</Text>
            <TextInput
              style={[createStyles.textInput, createStyles.textArea]}
              placeholder="Provide more details about the item..."
              placeholderTextColor={colors.text.secondary}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={createStyles.characterCount}>
              {formData.description.length}/2000
            </Text>
          </View>

          {/* Incident Date Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>When did this happen?</Text>
            <TouchableOpacity
              style={createStyles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={createStyles.dateButtonText}>
                {formatDate(formData.incidentDate)}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Contact Info Section */}
          <View style={createStyles.section}>
            <Text style={createStyles.sectionTitle}>
              Contact Information
              <Text style={createStyles.optionalText}> (Optional)</Text>
            </Text>
            <TextInput
              style={createStyles.textInput}
              placeholder="How should people contact you?"
              placeholderTextColor={colors.text.secondary}
              value={formData.contactInfo}
              onChangeText={(text) => handleInputChange("contactInfo", text)}
              maxLength={500}
            />
            <Text style={createStyles.characterCount}>
              {formData.contactInfo.length}/500
            </Text>
          </View>

          {/* Error Display */}
          {errors.length > 0 && (
            <View style={createStyles.errorContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={createStyles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={createStyles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={createStyles.continueButtonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
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

const createStyles = {
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

  // Layout
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
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

  // Post Type
  typeContainer: {
    flexDirection: "row" as const,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.surface,
    alignItems: "center" as const,
  },
  typeButtonActive: {
    borderColor: colors.richOxblood,
    backgroundColor: colors.richOxblood,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.text.primary,
  },
  typeButtonTextActive: {
    color: colors.white,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  categoryButton: {
    width: "30%",
    aspectRatio: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  categoryButtonActive: {
    borderColor: colors.richOxblood,
    backgroundColor: colors.richOxblood,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: "500" as const,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "center" as const,
    marginTop: 4,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },

  // Input Fields
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Nunito",
    color: colors.text.secondary,
    textAlign: "right" as const,
    marginTop: 4,
  },

  // Date Button
  dateButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Nunito",
    color: colors.text.primary,
  },

  // Error Display
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Nunito",
    color: "#dc2626",
    marginBottom: 4,
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
    marginTop: 16,
    marginBottom: 32,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "DMSans",
    color: colors.white,
  },
};
