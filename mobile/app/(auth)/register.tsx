import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Input, Button } from "@rneui/themed";
import { Link, router } from "expo-router";
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

      setTimeout(() => router.replace("/(auth)/login"), 2000);
    } catch (error: any) {
      console.log("Registration error:", error.message);
    }
  };

  const updateField = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.paddingLg}
    >
      <View style={globalStyles.center}>
        <Text style={globalStyles.heading1}>Create Account 🚀</Text>
        <Text style={[globalStyles.secondaryText, globalStyles.marginXxl]}>
          Join OPOSSUM community
        </Text>
      </View>

      <Input
        placeholder="Username *"
        leftIcon={{
          type: "ionicon",
          name: "person",
          color: colors.richOxblood,
        }}
        value={formData.username}
        onChangeText={(value) => updateField("username", value)}
        autoCapitalize="none"
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="username"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Input
        placeholder="Email *"
        leftIcon={{ type: "ionicon", name: "mail", color: colors.richOxblood }}
        value={formData.email}
        onChangeText={(value) => updateField("email", value)}
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
        placeholder="Password *"
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
        autoComplete="new-password"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Input
        placeholder="First Name"
        leftIcon={{
          type: "ionicon",
          name: "person-outline",
          color: colors.richOxblood,
        }}
        value={formData.firstName}
        onChangeText={(value) => updateField("firstName", value)}
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="given-name"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Input
        placeholder="Last Name"
        leftIcon={{
          type: "ionicon",
          name: "person-outline",
          color: colors.richOxblood,
        }}
        value={formData.lastName}
        onChangeText={(value) => updateField("lastName", value)}
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="family-name"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Input
        placeholder="Phone (optional)"
        leftIcon={{
          type: "ionicon",
          name: "call-outline",
          color: colors.richOxblood,
        }}
        value={formData.phone}
        onChangeText={(value) => updateField("phone", value)}
        keyboardType="phone-pad"
        containerStyle={globalStyles.inputContainer}
        inputStyle={globalStyles.bodyText}
        autoComplete="tel"
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.medium,
          paddingHorizontal: 10,
        }}
      />

      <Button
        title="Create Account"
        loading={isLoading}
        onPress={handleRegister}
        buttonStyle={[globalStyles.primaryButton, globalStyles.marginLg]}
        titleStyle={{ color: colors.white, fontSize: 16, fontWeight: "600" }}
        disabled={isLoading}
      />

      <View style={[globalStyles.center, globalStyles.marginXxl]}>
        <Link href="/(auth)/login">
          <Text
            style={[globalStyles.secondaryText, { color: colors.richOxblood }]}
          >
            Already have an account? Sign in
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
