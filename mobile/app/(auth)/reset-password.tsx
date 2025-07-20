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
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { authService } from "../../services/auth";
import { globalStyles, colors } from "../../styles";

export default function ResetPasswordMobileScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      const message = await authService.resetPassword(
        token as string,
        formData.newPassword,
        formData.confirmPassword
      );

      setResetSuccess(true);
      Toast.show({
        type: "success",
        text1: "Password Reset Successfully! ✅",
        text2: message,
        visibilityTime: 5000,
      });
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

  if (!token) {
    return (
      <View style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={globalStyles.authContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>❌</Text>
            </View>

            <Text
              style={[
                globalStyles.heading1,
                { color: colors.danger, textAlign: "center" },
              ]}
            >
              Invalid Reset Link
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 40 },
              ]}
            >
              This password reset link is invalid or has expired.
            </Text>

            <TouchableOpacity
              style={globalStyles.authButton}
              onPress={handleBackToAuth}
              activeOpacity={0.8}
            >
              <Text style={globalStyles.authButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (resetSuccess) {
    return (
      <View style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={globalStyles.authContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>

            <Text
              style={[
                globalStyles.heading1,
                { color: colors.success, textAlign: "center" },
              ]}
            >
              Password Reset!
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 40 },
              ]}
            >
              Your password has been successfully reset. You can now login with
              your new password.
            </Text>

            <TouchableOpacity
              style={globalStyles.authButton}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={globalStyles.authButtonText}>Continue to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={globalStyles.authContainer}>
        {/* Header */}
        <Text style={globalStyles.authHeader}>Reset Password</Text>

        <View style={globalStyles.authFormContainer}>
          {/* Instruction Text */}
          <Text
            style={[
              globalStyles.bodyText,
              {
                textAlign: "center",
                marginBottom: 30,
                lineHeight: 24,
              },
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
  content: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center" as const,
  },
  successIcon: {
    fontSize: 80,
  },
  errorIcon: {
    fontSize: 80,
  },
});
