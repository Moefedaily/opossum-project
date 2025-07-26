import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { userService } from "../../../services/user";
import { globalStyles, colors } from "../../../styles";
import {
  UpdateProfileRequest,
  UserProfileResponse,
} from "../../../types/profile";

export default function EditProfileScreen() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await userService.getCurrentUser();
      setUserProfile(profile);

      // Initialize form with current data
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    } catch (error: any) {
      console.error("Failed to load user profile:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Profile",
        text2: error.message || "Please try again",
      });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Check if there are changes
      const originalData = {
        firstName: userProfile?.firstName || "",
        lastName: userProfile?.lastName || "",
        phone: userProfile?.phone || "",
      };

      const hasChanges = Object.keys(newData).some(
        (key) =>
          newData[key as keyof UpdateProfileRequest] !==
          originalData[key as keyof UpdateProfileRequest]
      );

      setHasChanges(hasChanges);
      return newData;
    });
  };

  const validateForm = (): boolean => {
    // First name validation
    if (!formData.firstName?.trim()) {
      Toast.show({
        type: "error",
        text1: "First Name Required",
        text2: "Please enter your first name",
      });
      return false;
    }

    if (formData.firstName.trim().length < 2) {
      Toast.show({
        type: "error",
        text1: "Invalid First Name",
        text2: "First name must be at least 2 characters",
      });
      return false;
    }

    // Last name validation
    if (!formData.lastName?.trim()) {
      Toast.show({
        type: "error",
        text1: "Last Name Required",
        text2: "Please enter your last name",
      });
      return false;
    }

    if (formData.lastName.trim().length < 2) {
      Toast.show({
        type: "error",
        text1: "Invalid Last Name",
        text2: "Last name must be at least 2 characters",
      });
      return false;
    }

    if (formData.phone?.trim()) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        Toast.show({
          type: "error",
          text1: "Invalid Phone Number",
          text2: "Please enter a valid phone number",
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    if (!hasChanges) {
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "No changes were made to save",
      });
      return;
    }

    try {
      setIsSaving(true);

      const cleanData: UpdateProfileRequest = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        phone: formData.phone?.trim() || undefined,
      };

      const updatedProfile = await userService.updateProfile(cleanData);
      setUserProfile(updatedProfile);
      setHasChanges(false);

      Toast.show({
        type: "success",
        text1: "Profile Updated! ✅",
        text2: "Your profile has been successfully updated",
        visibilityTime: 3000,
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.push("/(tabs)/profile/index"),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // TODO: Implement avatar upload feature
  // This will be added later with:
  // 1. Image picker (camera/gallery)
  // 2. Image cropping/resizing
  // 3. Upload to backend
  // 4. Update avatar URL
  const handleChangeAvatar = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Avatar upload will be available soon!",
    });
  };

  const getInputContainerStyle = (field: string) => [
    globalStyles.authInputContainer,
    focusedField === field && globalStyles.authInputFocused,
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.richOxblood} />
        <Text
          style={[
            globalStyles.bodyText,
            { marginTop: 16, textAlign: "center" },
          ]}
        >
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.errorContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <Text style={[globalStyles.heading2, { textAlign: "center" }]}>
          Failed to Load Profile
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
          </TouchableOpacity>

          <Text style={[globalStyles.heading2, styles.headerTitle]}>
            Edit Profile
          </Text>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveProfile}
            disabled={!hasChanges || isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {/* TODO: Replace with actual avatar image when upload is implemented */}
              {userProfile.avatarUrl ? (
                // When avatar upload is implemented, show actual image here
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color={colors.white} />
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color={colors.white} />
                </View>
              )}
            </View>

            {/* TODO: Avatar upload button - implement later */}
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.richOxblood}
              />
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Account Info (Read-only) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.readOnlyField}>
                <Text style={styles.fieldLabel}>Username</Text>
                <Text style={styles.fieldValue}>{userProfile.username}</Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{userProfile.email}</Text>
                <View style={styles.verificationBadge}>
                  <Ionicons
                    name={
                      userProfile.isVerified
                        ? "checkmark-circle"
                        : "time-outline"
                    }
                    size={14}
                    color={
                      userProfile.isVerified ? colors.success : colors.warning
                    }
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: userProfile.isVerified
                          ? colors.success
                          : colors.warning,
                      },
                    ]}
                  >
                    {userProfile.isVerified ? "Verified" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Personal Info (Editable) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {/* First Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>First Name *</Text>
                <View style={getInputContainerStyle("firstName")}>
                  <TextInput
                    style={globalStyles.authInput}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.text.secondary}
                    value={formData.firstName}
                    onChangeText={(value) => updateField("firstName", value)}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    editable={!isSaving}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Last Name *</Text>
                <View style={getInputContainerStyle("lastName")}>
                  <TextInput
                    style={globalStyles.authInput}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.text.secondary}
                    value={formData.lastName}
                    onChangeText={(value) => updateField("lastName", value)}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    editable={!isSaving}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Phone Number *</Text>
                <View style={getInputContainerStyle("phone")}>
                  <TextInput
                    style={globalStyles.authInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.text.secondary}
                    value={formData.phone}
                    onChangeText={(value) => updateField("phone", value)}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Button (Mobile) */}
          <View style={styles.mobileButtonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!hasChanges || isSaving) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSaveProfile}
              disabled={!hasChanges || isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 20, // ✅ Reduced from previous - SafeAreaView handles safe area
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center" as const,
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: "center" as const,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  contentContainer: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center" as const,
    paddingVertical: 32,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.richOxblood,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  changeAvatarButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeAvatarText: {
    color: colors.richOxblood,
    fontSize: 16,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  readOnlyField: {
    marginBottom: 16,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.info + "15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  verificationBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 4,
  },
  verificationText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500" as const,
  },
  mobileButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  primaryButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center" as const,
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center" as const,
  },
  secondaryButtonText: {
    color: colors.richOxblood,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  bottomSpacing: {
    height: 32,
  },
});
