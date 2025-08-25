// app/(auth)/login.tsx - Complete Enhanced Version
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/auth";
import { LoginRequest } from "../../types/auth";
import { globalStyles, colors } from "../../styles";

export default function LoginScreen() {
  const [formData, setFormData] = useState<LoginRequest>({
    login: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "verification" | "credentials" | "network" | null
  >(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const { login, isLoading } = useAuth();

  const detectErrorType = (
    error: any
  ): "verification" | "credentials" | "network" => {
    const errorMessage = error.message?.toLowerCase() || "";

    console.log("🔍 Debugging error detection:");
    console.log("Original error:", error);
    console.log("Error message:", error.message);
    console.log("Lowercase message:", errorMessage);

    if (
      errorMessage.includes("verify") ||
      errorMessage.includes("verification") ||
      errorMessage.includes("not verified") ||
      errorMessage.includes("unverified")
    ) {
      console.log("Detected as VERIFICATION error");
      return "verification";
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection")
    ) {
      console.log("Detected as NETWORK error");
      return "network";
    }

    console.log("Detected as CREDENTIALS error");
    return "credentials";
  };

  const handleResendVerification = async () => {
    if (!formData.login) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address",
      });
      return;
    }

    try {
      setIsResendingVerification(true);
      await authService.resendVerification(formData.login);

      setErrorType(null);
      Toast.show({
        type: "success",
        text1: "Verification Email Sent!",
        text2: "Check your email and click the verification link",
        visibilityTime: 5000,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Send Email",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.login || !formData.password) {
      Toast.show({
        type: "error",
        text1: "Missing Required Fields",
        text2: "Please enter both email and password",
      });
      return;
    }

    try {
      setErrorType(null); // Clear previous errors
      const response = await login(formData);

      if (response) {
        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: `Hello ${response.user.firstName || response.user.username}!`,
        });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      // Enhanced error handling
      const detectedErrorType = detectErrorType(error);
      setErrorType(detectedErrorType);

      // Show appropriate toast
      switch (detectedErrorType) {
        case "verification":
          Toast.show({
            type: "error",
            text1: "Email Not Verified",
            text2: "Please verify your email to login",
            visibilityTime: 4000,
          });
          break;
        case "credentials":
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: "Please check your credentials",
          });
          break;
        case "network":
          Toast.show({
            type: "error",
            text1: "Connection Error",
            text2: "Please check your internet connection",
          });
          break;
      }
    }
  };

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errorType) {
      setErrorType(null);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
  };

  const getInputContainerStyle = (field: string) => [
    globalStyles.authInputContainer,
    focusedField === field && globalStyles.authInputFocused,
  ];

  const renderErrorDisplay = () => {
    if (!errorType) return null;

    switch (errorType) {
      case "verification":
        return (
          <View style={enhancedStyles.errorContainer}>
            <Text style={enhancedStyles.errorTitle}>Email Not Verified</Text>
            <Text style={enhancedStyles.errorMessage}>
              Please check your email and click the verification link, or resend
              a new verification email.
            </Text>
            <TouchableOpacity
              style={[
                enhancedStyles.resendButton,
                isResendingVerification && { opacity: 0.6 },
              ]}
              onPress={handleResendVerification}
              disabled={isResendingVerification}
              activeOpacity={0.8}
            >
              <Text style={enhancedStyles.resendButtonText}>
                {isResendingVerification
                  ? "Sending..."
                  : "Resend Verification Email"}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "credentials":
        return (
          <View style={enhancedStyles.errorContainer}>
            <Text style={enhancedStyles.errorTitle}>Login Failed</Text>
            <Text style={enhancedStyles.errorMessage}>
              Please check your email and password and try again.
            </Text>
          </View>
        );

      case "network":
        return (
          <View style={enhancedStyles.errorContainer}>
            <Text style={enhancedStyles.errorTitle}>Connection Error</Text>
            <Text style={enhancedStyles.errorMessage}>
              Please check your internet connection and try again.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back Button */}
      <TouchableOpacity
        style={globalStyles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
      </TouchableOpacity>

      <View style={globalStyles.authContainer}>
        {/* Header */}
        <Text style={globalStyles.authHeader}>Log in.</Text>

        <View style={globalStyles.authFormContainer}>
          {/* Email Input */}
          <View style={getInputContainerStyle("login")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="EMAIL"
              placeholderTextColor={colors.text.secondary}
              value={formData.login}
              onChangeText={(value) => updateField("login", value)}
              onFocus={() => setFocusedField("usernameOrEmail")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={getInputContainerStyle("password")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="PASSWORD"
              placeholderTextColor={colors.text.secondary}
              value={formData.password}
              onChangeText={(value) => updateField("password", value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          {/* Enhanced Error Display */}
          {renderErrorDisplay()}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              globalStyles.authButton,
              isLoading && globalStyles.authButtonLoading,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.authButtonText}>
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <View style={globalStyles.authLinksContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={globalStyles.authLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Social Buttons */}
          <View style={globalStyles.socialButtonsContainer}>
            <Text style={globalStyles.socialButtonsTitle}>OR SIGN IN WITH</Text>

            <View style={globalStyles.socialButtonsRow}>
              {/* Google Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.googleButton]}
                onPress={() => handleSocialLogin("Google")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={24} color="#4285f4" />
              </TouchableOpacity>

              {/* Facebook Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.facebookButton]}
                onPress={() => handleSocialLogin("Facebook")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={24} color="white" />
              </TouchableOpacity>

              {/* Twitter Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.twitterButton]}
                onPress={() => handleSocialLogin("Twitter")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-twitter" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Links */}
          <View style={globalStyles.authLinksContainer}>
            <Text style={globalStyles.caption}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={globalStyles.authLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const enhancedStyles = StyleSheet.create({
  errorContainer: {
    backgroundColor: colors.softRose,
    borderLeftWidth: 4,
    borderLeftColor: colors.richOxblood,
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.richOxblood,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  resendButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start" as const,
  },
  resendButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
