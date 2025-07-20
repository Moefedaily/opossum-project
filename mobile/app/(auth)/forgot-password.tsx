// app/(auth)/forgot-password.tsx
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
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { authService } from "../../services/auth";
import { globalStyles, colors } from "../../styles";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSendResetEmail = async () => {
    // Validation
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    try {
      setIsLoading(true);
      const message = await authService.forgotPassword(email);

      setEmailSent(true);
      Toast.show({
        type: "success",
        text1: "Reset Email Sent! 📧",
        text2: "Check your email for reset instructions",
        visibilityTime: 5000,
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Send Email",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetEmail();
  };

  const getInputContainerStyle = () => [
    globalStyles.authInputContainer,
    focusedField === "email" && globalStyles.authInputFocused,
  ];

  if (emailSent) {
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
          {/* Success State */}
          <View style={styles.successContainer}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>📧</Text>
            </View>

            {/* Success Message */}
            <Text style={[globalStyles.authHeader, { color: colors.success }]}>
              Email Sent!
            </Text>

            <Text
              style={[
                globalStyles.bodyText,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              We've sent password reset instructions to:
            </Text>

            <Text
              style={[
                globalStyles.heading3,
                {
                  textAlign: "center",
                  color: colors.richOxblood,
                  marginBottom: 30,
                },
              ]}
            >
              {email}
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
              Check your email and click the reset link to create a new
              password. If you don't see the email, check your spam folder.
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleResendEmail}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Resend Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

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
        <Text style={globalStyles.authHeader}>Forgot Password?</Text>

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
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </Text>

          {/* Email Input */}
          <View style={getInputContainerStyle()}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="EMAIL"
              placeholderTextColor={colors.text.secondary}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          {/* Send Reset Email Button */}
          <TouchableOpacity
            style={[
              globalStyles.authButton,
              isLoading && globalStyles.authButtonLoading,
            ]}
            onPress={handleSendResetEmail}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.authButtonText}>
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={globalStyles.authLinksContainer}>
            <TouchableOpacity onPress={handleBackToLogin} activeOpacity={0.7}>
              <Text style={globalStyles.authLink}>
                Remember your password? Back to Login
              </Text>
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
  successIcon: {
    fontSize: 80,
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
