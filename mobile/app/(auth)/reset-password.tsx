import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { authService } from "../../services/auth";
import { globalStyles, colors } from "../../styles";

export default function ResetPasswordMobileScreen() {
  const { token, status, message } = useLocalSearchParams<{
    token?: string;
    status?: "error";
    message?: string;
  }>();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Handle API call to actually reset password
  const handleResetPassword = async () => {
    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in both password fields",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password Too Short",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Don't Match",
        text2: "Please make sure both passwords are the same",
      });
      return;
    }

    if (!token) {
      Toast.show({
        type: "error",
        text1: "Invalid Reset Link",
        text2: "Reset token is missing",
      });
      return;
    }

    try {
      setIsLoading(true);
      // THIS API CALL IS CORRECT AND NEEDED!
      const message = await authService.resetPassword(
        token as string,
        formData.newPassword,
        formData.confirmPassword
      );

      setResetSuccess(true);
      // NO MORE TOAST - Clean success state only
    } catch (error: any) {
      console.error("Password reset error:", error);
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleBackToAuth = () => {
    router.replace("/(auth)/");
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getInputContainerStyle = (field: string) => [
    globalStyles.authInputContainer,
    focusedField === field && globalStyles.authInputFocused,
  ];

  // ERROR CASE: Backend redirect with error
  if (status === "error") {
    return (
      <ScrollView style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={handleBackToAuth}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <View style={globalStyles.authContainer}>
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={80} color={colors.danger} />
            </View>

            <Text style={[globalStyles.authHeader, { color: colors.danger }]}>
              Invalid Reset Link
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              {message || "This password reset link is invalid or has expired."}
            </Text>

            <Text
              style={[
                globalStyles.secondaryText,
                {
                  textAlign: "center",
                  marginBottom: 40,
                  lineHeight: 22,
                },
              ]}
            >
              Please request a new password reset link from the forgot password
              page.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!token) {
    return (
      <ScrollView style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={handleBackToAuth}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <View style={globalStyles.authContainer}>
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={80} color={colors.danger} />
            </View>

            <Text style={[globalStyles.authHeader, { color: colors.danger }]}>
              Invalid Reset Link
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              This password reset link is invalid or missing token.
            </Text>

            <Text
              style={[
                globalStyles.secondaryText,
                {
                  textAlign: "center",
                  marginBottom: 40,
                  lineHeight: 22,
                },
              ]}
            >
              Please request a new password reset link from the forgot password
              page.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // SUCCESS CASE: Password was reset successfully
  if (resetSuccess) {
    return (
      <ScrollView style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={handleBackToLogin}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <View style={globalStyles.authContainer}>
          <View style={styles.successContainer}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={colors.success}
              />
            </View>

            <Text style={[globalStyles.authHeader, { color: colors.success }]}>
              Password Reset!
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              Your password has been successfully reset. You can now login with
              your new password.
            </Text>

            <Text
              style={[
                globalStyles.secondaryText,
                {
                  textAlign: "center",
                  marginBottom: 40,
                  lineHeight: 22,
                },
              ]}
            >
              Welcome back! Your account is now secure with your new password.
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Continue to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // MAIN FORM: Show password reset form
  return (
    <ScrollView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back Button */}
      <TouchableOpacity
        style={globalStyles.backButton}
        onPress={handleBackToLogin}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
      </TouchableOpacity>

      <View style={globalStyles.authContainer}>
        {/* Header */}
        <Text style={globalStyles.authHeader}>Reset Password</Text>

        <View style={globalStyles.authFormContainer}>
          {/* Instruction Text */}
          <Text
            style={[
              globalStyles.bodyText,
              { textAlign: "center", marginBottom: 30, lineHeight: 24 },
            ]}
          >
            Enter your new password below.
          </Text>

          {/* New Password Input */}
          <View style={getInputContainerStyle("newPassword")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="NEW PASSWORD"
              placeholderTextColor={colors.text.secondary}
              value={formData.newPassword}
              onChangeText={(value) => updateField("newPassword", value)}
              onFocus={() => setFocusedField("newPassword")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={getInputContainerStyle("confirmPassword")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="CONFIRM PASSWORD"
              placeholderTextColor={colors.text.secondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateField("confirmPassword", value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            style={[
              globalStyles.authButton,
              isLoading && globalStyles.authButtonLoading,
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.authButtonText}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={globalStyles.authLinksContainer}>
            <TouchableOpacity onPress={handleBackToLogin} activeOpacity={0.7}>
              <Text style={globalStyles.authLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center" as const,
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
});
