import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Input, Button } from "@rneui/themed";
import { Link, router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest } from "../../types/auth";
import { globalStyles, colors } from "../../styles";

export default function LoginScreen() {
  const [formData, setFormData] = useState<LoginRequest>({
    login: "",
    password: "",
  });
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
      console.log("🚀 Starting login process...");
      const response = await login(formData);
      console.log("✅ Login successful, navigating to tabs...");

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);

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

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.paddingLg}
    >
      <View style={globalStyles.center}>
        <Text style={globalStyles.heading1}>Welcome Back! 👋</Text>
        <Text style={[globalStyles.secondaryText, globalStyles.marginXxl]}>
          Sign in to OPOSSUM
        </Text>
      </View>

      <Input
        placeholder="Email or Username"
        leftIcon={{ type: "ionicon", name: "mail", color: colors.richOxblood }}
        value={formData.login}
        onChangeText={(value) => updateField("login", value)}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="email"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Input
        placeholder="Password"
        leftIcon={{
          type: "ionicon",
          name: "lock-closed",
          color: colors.richOxblood,
        }}
        value={formData.password}
        onChangeText={(value) => updateField("password", value)}
        secureTextEntry
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="password"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Button
        title={isLoading ? "Signing In..." : "Sign In"}
        loading={isLoading}
        onPress={handleLogin}
        buttonStyle={[globalStyles.primaryButton, globalStyles.marginLg]}
        titleStyle={{ color: colors.white, fontSize: 16, fontWeight: "600" }}
        disabled={isLoading}
      />

      <View style={[globalStyles.center, globalStyles.marginXxl]}>
        <Link href="/(auth)/register">
          <Text
            style={[globalStyles.secondaryText, { color: colors.richOxblood }]}
          >
            Don't have an account? Sign up
          </Text>
        </Link>
      </View>

      <View style={[globalStyles.center, globalStyles.marginLg]}>
        <Link href="/(auth)/forgot-password">
          <Text
            style={[globalStyles.secondaryText, { color: colors.richOxblood }]}
          >
            Forgot your password?
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
