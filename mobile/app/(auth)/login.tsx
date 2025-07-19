import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../types/auth";
import { globalStyles, colors } from "../../styles";

export default function LoginScreen() {
  const [formData, setFormData] = useState<LoginRequest>({
    login: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading, resendVerification } = useAuth();

  const handleLogin = async () => {
    if (!formData.login || !formData.password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      console.log("Starting login process...");
      const response = await login(formData);
      console.log("Login successful, navigating to tabs...");

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      console.error("Login failed:", error.message);

      if (error.message?.includes("verify")) {
        Toast.show({
          type: "info",
          text1: "Email Verification Required",
          text2: "Tap here to resend verification email",
          onPress: () => handleResendVerification(),
          visibilityTime: 6000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: error.message,
        });
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification(formData.login);
    } catch (error) {
      // AuthContext already shows error toast
    }
  };

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
  };

  const getInputContainerStyle = (field: string) => [
    globalStyles.authInputContainer,
    focusedField === field && globalStyles.authInputFocused,
  ];

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
          {/* Email/Username Input */}
          <View style={getInputContainerStyle("login")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="EMAIL"
              placeholderTextColor={colors.text.secondary}
              value={formData.login}
              onChangeText={(value) => updateField("login", value)}
              onFocus={() => setFocusedField("login")}
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
              autoComplete="password"
            />
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                globalStyles.authLink,
                { textAlign: "right", marginBottom: 20 },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

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
              {isLoading ? "Signing in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          {/* Social Login Section */}
          <View style={globalStyles.socialButtonsContainer}>
            <Text style={globalStyles.socialButtonsTitle}>OR SIGN IN WITH</Text>

            <View style={globalStyles.socialButtonsRow}>
              {/* Google Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.googleButton]}
                onPress={() => handleSocialLogin("Google")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-google"
                  size={24}
                  color={colors.text.primary}
                />
              </TouchableOpacity>

              {/* Facebook Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.facebookButton]}
                onPress={() => handleSocialLogin("Facebook")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={24} color={colors.white} />
              </TouchableOpacity>

              {/* Twitter Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.twitterButton]}
                onPress={() => handleSocialLogin("Twitter")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-twitter" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={globalStyles.authLinksContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={globalStyles.authLink}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
