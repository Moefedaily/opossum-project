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
import { RegisterRequest } from "../../types/auth";
import { globalStyles, colors } from "../../styles";

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Toast.show({
        type: "error",
        text1: "Missing Required Fields",
        text2: "Username, email, and password are required",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    if (formData.password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password Too Short",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    try {
      await register(formData);

      Toast.show({
        type: "success",
        text1: "Check Your Email! 📧",
        text2: "Verify your email, then sign in",
        visibilityTime: 4000,
      });

      setTimeout(() => router.replace("/(auth)/login"), 5000);
    } catch (error: any) {
      console.log("Registration error:", error.message);
    }
  };

  const updateField = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialRegister = (provider: string) => {
    Alert.alert(
      "Coming Soon",
      `${provider} registration will be available soon!`
    );
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
        <Text style={globalStyles.authHeader}>Sign up.</Text>

        <View style={globalStyles.authFormContainer}>
          {/* Username Input */}
          <View style={getInputContainerStyle("username")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="NAME"
              placeholderTextColor={colors.text.secondary}
              value={formData.username}
              onChangeText={(value) => updateField("username", value)}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              autoComplete="username"
            />
          </View>

          {/* Email Input */}
          <View style={getInputContainerStyle("email")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="EMAIL"
              placeholderTextColor={colors.text.secondary}
              value={formData.email}
              onChangeText={(value) => updateField("email", value)}
              onFocus={() => setFocusedField("email")}
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
              autoComplete="new-password"
            />
          </View>

          {/* Phone Input */}
          <View style={getInputContainerStyle("phone")}>
            <TextInput
              style={globalStyles.authInput}
              placeholder="PHONE"
              placeholderTextColor={colors.text.secondary}
              value={formData.phone}
              onChangeText={(value) => updateField("phone", value)}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Privacy Notice */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={[
                globalStyles.caption,
                { textAlign: "center", lineHeight: 18 },
              ]}
            >
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              globalStyles.authButton,
              isLoading && globalStyles.authButtonLoading,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.authButtonText}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Social Registration Section */}
          <View style={globalStyles.socialButtonsContainer}>
            <Text style={globalStyles.socialButtonsTitle}>OR SIGN UP WITH</Text>

            <View style={globalStyles.socialButtonsRow}>
              {/* Google Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.googleButton]}
                onPress={() => handleSocialRegister("Google")}
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
                onPress={() => handleSocialRegister("Facebook")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={24} color={colors.white} />
              </TouchableOpacity>

              {/* Twitter Button */}
              <TouchableOpacity
                style={[globalStyles.socialButton, globalStyles.twitterButton]}
                onPress={() => handleSocialRegister("Twitter")}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-twitter" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Link */}
          <View style={globalStyles.authLinksContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={globalStyles.authLink}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
