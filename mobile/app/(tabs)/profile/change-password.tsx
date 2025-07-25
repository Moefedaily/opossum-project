// app/(tabs)/profile/change-password.tsx
import React, { useState } from "react";
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
  SafeAreaView, // ✅ Added SafeAreaView import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { userService } from "../../../services/user";
import { globalStyles, colors } from "../../../styles";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordScreen() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateField = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    // Current password validation
    if (!formData.currentPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Current Password Required",
        text2: "Please enter your current password",
      });
      return false;
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "New Password Required",
        text2: "Please enter your new password",
      });
      return false;
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password Too Short",
        text2: "New password must be at least 6 characters long",
      });
      return false;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Confirm Password Required",
        text2: "Please confirm your new password",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Don't Match",
        text2: "New password and confirmation don't match",
      });
      return false;
    }

    // Check if new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      Toast.show({
        type: "error",
        text1: "Same Password",
        text2: "New password must be different from current password",
      });
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Call the auth service to change password
      await userService.changePassword({
        currentPassword: formData.currentPassword.trim(),
        newPassword: formData.newPassword.trim(),
        confirmPassword: formData.confirmPassword.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Password Changed! ✅",
        text2: "Your password has been successfully updated",
        visibilityTime: 4000,
      });

      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Change password error:", error);

      // Handle specific error messages
      let errorMessage = error.message || "Please try again";

      if (error.message?.toLowerCase().includes("current password")) {
        errorMessage = "Current password is incorrect";
      } else if (error.message?.toLowerCase().includes("invalid")) {
        errorMessage = "Current password is invalid";
      }

      Toast.show({
        type: "error",
        text1: "Password Change Failed",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to go back without changing your password?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const getInputContainerStyle = (field: string) => [
    globalStyles.authInputContainer,
    focusedField === field && globalStyles.authInputFocused,
  ];

  const renderPasswordInput = (
    field: keyof ChangePasswordFormData,
    placeholder: string,
    showKey: "current" | "new" | "confirm",
    label: string,
    hint?: string
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={getInputContainerStyle(field)}>
          <TextInput
            style={[globalStyles.authInput, styles.passwordInput]}
            placeholder={placeholder}
            placeholderTextColor={colors.text.secondary}
            value={formData[field]}
            onChangeText={(value) => updateField(field, value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            secureTextEntry={!showPasswords[showKey]}
            autoComplete="password"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => togglePasswordVisibility(showKey)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPasswords[showKey] ? "eye-off" : "eye"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
    );
  };

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
            Change Password
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.contentContainer}>
          {/* Security Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={24} color={colors.info} />
            </View>
            <Text style={styles.infoText}>
              For your security, you need to provide your current password to
              set a new one.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Current Password */}
            {renderPasswordInput(
              "currentPassword",
              "Enter your current password",
              "current",
              "Current Password *",
              "Your existing password for verification"
            )}

            {/* New Password */}
            {renderPasswordInput(
              "newPassword",
              "Enter your new password",
              "new",
              "New Password *",
              "Must be at least 6 characters long"
            )}

            {/* Confirm Password */}
            {renderPasswordInput(
              "confirmPassword",
              "Confirm your new password",
              "confirm",
              "Confirm New Password *",
              "Re-enter your new password"
            )}
          </View>

          {/* Security Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Password Guidelines:</Text>
            <View style={styles.guideline}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.guidelineText}>
                At least 6 characters long
              </Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.guidelineText}>
                Different from your current password
              </Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.guidelineText}>
                Use a mix of letters, numbers, and symbols
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancel}
              activeOpacity={0.8}
              disabled={isLoading}
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
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 20, // ✅ Reduced - SafeAreaView handles safe area
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
  headerSpacer: {
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    backgroundColor: colors.info + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.info + "30",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.info,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
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
  passwordInput: {
    paddingRight: 50, // Space for eye icon
  },
  eyeButton: {
    position: "absolute" as const,
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: 40,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  guidelinesContainer: {
    backgroundColor: colors.warmTaupe,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  guideline: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 24,
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
